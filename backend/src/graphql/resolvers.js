// src/graphql/resolvers.js
import User from '../models/User.js';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Función auxiliar para generar token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '30m' // Sesión de 30 minutos
    });
};

const resolvers = {
    Query: {
        // me: Obtiene el usuario autenticado
        me: (parent, args, context) => context.user,
        
        // products: Filtra y busca productos
       products: async (parent, { category, search }, context) => {
        let filter = {};

        // 1. FILTRO DE DISPONIBILIDAD (Solo clientes ven productos disponibles)
        // b07-catalog/catalog.js
        // Si el usuario no está logueado O es un cliente, solo ve productos disponibles.
        if (!context.user || context.user.role === 'customer') {
            filter.available = true;
        }
        // Si es Admin o Cajero, no aplicamos este filtro, ven todos.

        // 2. FILTRO POR CATEGORÍA
        if (category && category !== 'all') {
            filter.category = category;
        }

        // 3. FILTRO DE BÚSQUEDA (search)
        if (search) {
            // Utilizamos $or para buscar el texto en el nombre O la categoría.
            // $regex + $options: 'i' permite una búsqueda parcial e insensible a mayúsculas.
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        return await Product.find(filter).sort({ category: 1, name: 1 });
    },

        // orders: Ejemplo de obtención de órdenes (se requiere autenticación/autorización)
        orders: async (parent, { status }, context) => {
        // 1. Autorización: El usuario debe estar logueado para ver pedidos
        if (!context.user) {
            throw new Error('No autorizado. Debes iniciar sesión para ver los pedidos.');
        }

        let filter = {};
        const userId = context.user._id;

        if (context.user.role === 'customer') {
            // b06-tracking/tracking.js:
            // Los clientes solo ven sus propios pedidos.
            filter.userId = userId;

        } else if (context.user.role === 'admin' || context.user.role === 'cashier') {
            // b05-dispatch/dispatch.js:
            // Admin y Cajero ven todos los pedidos.
            if (status) {
                // Si se especifica un estado (ej. "En preparación"), se filtra.
                filter.orderStatus = status;
            }
        } else {
            throw new Error('Rol no permitido para acceder a los pedidos.');
        }

        // 2. Ejecutar la consulta
        // .populate('userId') trae los datos del cliente si son necesarios
        return await Order.find(filter)
            .populate('userId') 
            .sort({ createdAt: -1 }); // Mostrar los más recientes primero
    },
    },
    
    Mutation: {
        // register: Registro de nuevo usuario (cliente)
        register: async (parent, { name, email, password, address, phone }) => {
            const user = new User({ name, email, password, address, phone, role: 'customer' });
            await user.save();
            const token = generateToken(user);
            return { user, token };
        },
        
        // login: Inicio de sesión
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user || !(await user.matchPassword(password))) {
                throw new Error('Credenciales inválidas.');
            }
            const token = generateToken(user);
            return { user, token };
        },

        // createProduct: Ejemplo de mutación (requiere rol de admin)
        createProduct: async (parent, args, context) => {
            if (context.user.role !== 'admin') {
                throw new Error('No autorizado.');
            }
            const product = new Product(args);
            return await product.save();
        },
        
        // createOrder: Creación de pedido (cliente)
        createOrder: async (parent, { items, paymentMethod, deliveryType }, context) => {
            // 1. Autorización: Solo clientes pueden crear pedidos
            if (!context.user || context.user?.role !== 'customer') {
                throw new Error('No autorizado. Solo clientes pueden crear pedidos.');
            }

            const { user } = context;
            if (!items || items.length === 0) {
                throw new Error('El carrito está vacío');
            }

            let subtotal = 0;
            const orderItems = [];

            // 2. Cálculo de totales y validación de stock
            for (const item of items) {
                // 1. VALIDACIÓN DE FORMATO DE ID
                if (!mongoose.Types.ObjectId.isValid(item.productId)) {
                    throw new Error(`El formato del ID de producto es inválido: ${item.productId}`);
                }

                // 2. BUSCAR EL PRODUCTO CON EL ID CASTEADO
                // Forzamos la búsqueda con mongoose.Types.ObjectId.createFromHexString()
                const product = await Product.findById(mongoose.Types.ObjectId.createFromHexString(item.productId));

                if (!product || !product.available) {
                    // Si el producto no es encontrado, sigue lanzando el error
                    throw new Error(`Producto no disponible o no encontrado: ${item.productId}`);
                }

                // El precio real se toma de la BD, no del cliente, por seguridad
                const itemPrice = product.price * item.quantity;
                subtotal += itemPrice;

                orderItems.push({
                    productId: product._id,
                    name: product.name,
                    quantity: item.quantity,
                    price: product.price,
                    image: product.image || null
                });
            }

            // 3. CÁLCULO DE TAX Y TOTAL (Requiere que subtotal esté calculado)
            const tax = Math.round(subtotal * 0.19); // IVA 19%
            const total = subtotal + tax;

            // GENERAR ORDER NUMBER (Requiere que Order esté importado)
            const nextOrderCount = await Order.estimatedDocumentCount();
            const orderNumber = `#${nextOrderCount + 1024}`;

            // ASIGNACIÓN DE ESTADOS (Corregir el ENUM)
            let paymentStatus;
            let orderStatus;

            if (paymentMethod === 'Tarjeta') {
                paymentStatus = 'Pagado';
                orderStatus = 'En preparación';
            } else if (paymentMethod === 'Efectivo' || paymentMethod === 'Transferencia') {
                // CORRECCIÓN: USAR 'Pendiente' con P mayúscula
                paymentStatus = paymentMethod === 'Efectivo' ? 'Pago a la entrega' : 'Pendiente de comprobante';
                orderStatus = 'Pendiente';
            } else {
                paymentStatus = 'Pendiente';
                orderStatus = 'Pendiente';
            }

            // CREACIÓN DEL OBJETO NEWORDER (Ahora todos los campos requeridos están asignados)
            const userId = user._id || user.id;
            const newOrder = new Order({
                orderNumber: orderNumber,
                userId: userId,
                customerName: user.name,
                items: orderItems,
                subtotal,
                tax,
                total,
                paymentMethod,
                paymentStatus,
                orderStatus,
                deliveryType,
                estimatedTime: deliveryType === 'Retiro en tienda' ? 15 : 35,
            });

            await newOrder.save();

            // 5. Actualizar stock: decrementar cantidades (si aplica)
            for (const item of items) {
                await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -Math.abs(item.quantity) } });
            }

            return newOrder;
        },

        // updateOrderStatus: Actualiza el estado de una orden y registra una notificación
        updateOrderStatus: async (parent, { id, newStatus }, context) => {
            // 1. Autorización: Solo Admin o Cajero
            if (!context.user || (context.user.role !== 'admin' && context.user.role !== 'cashier')) {
                throw new Error('Permiso denegado. Solo personal de despacho puede actualizar el estado.');
            }

            // 2. Validación de estado (opcional, pero buena práctica)
            const validStatuses = ['En preparación', 'En camino', 'Entregado', 'Cancelado'];
            if (!validStatuses.includes(newStatus)) {
                throw new Error('Estado de pedido inválido.');
            }

            // 3. Validar formato de ID
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new Error('Formato de ID inválido para el pedido.');
            }

            // 4. Actualizar el pedido
            const order = await Order.findById(id);

            if (!order) throw new Error('Pedido no encontrado.');

            // Asegurar que exista el array notifications
            order.notifications = order.notifications || [];

            // Simular el registro de notificación (lógica de notifications.js)
            order.notifications.push({
                status: newStatus,
                message: `Tu pedido ha sido marcado como: ${newStatus}`,
                sentAt: new Date()
            });

            order.orderStatus = newStatus;
            await order.save();

            return order;
        },

        updateProductAvailability: async (parent, { id, available }, context) => {

            // 1. Autorización: Verificar si el usuario está autenticado y tiene rol permitido
            if (!context.user) {
                throw new Error('No autorizado. Debes iniciar sesión.');
            }
                const allowedRoles = ['admin', 'cashier'];
                if (!allowedRoles.includes(context.user.role)) {
                    throw new Error('Permiso denegado. Solo administradores y cajeros pueden modificar la disponibilidad.');
                }

                // 2. Ejecutar la actualización en MongoDB
                const product = await Product.findByIdAndUpdate(
                    id,
                    { available: available },
                    { new: true, runValidators: true } // 'new: true' retorna el documento modificado
                );

                if (!product) {
                    throw new Error('Producto no encontrado.');
                }

                return product;
        }
        
    },
};

export default resolvers;