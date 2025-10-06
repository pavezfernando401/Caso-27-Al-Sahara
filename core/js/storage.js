// ==================== STORAGE MANAGER ====================
// Maneja toda la persistencia de datos en localStorage

class StorageManager {
    // Inicializa datos por defecto si no existen
    static init() {
        // Usuarios predefinidos - siempre verificar y crear si no existen
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 1,
                    email: 'correo@example.com',
                    password: 'Elpepe2025',
                    name: 'Juan Pérez',
                    rut: '12.345.678-9',
                    address: 'Av. Central 123',
                    phone: '+56 9 8667 2450',
                    birthdate: '1990-05-15',
                    gender: 'Hombre',
                    role: 'customer',
                    failedAttempts: 0,
                    blockedUntil: null,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    email: 'admin@alsahara.cl',
                    password: 'Admin2025',
                    name: 'Administrador',
                    role: 'admin',
                    failedAttempts: 0,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    email: 'cajero@alsahara.cl',
                    password: 'Cajero2025',
                    name: 'Cajero Virtual',
                    role: 'cashier',
                    failedAttempts: 0,
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Productos predefinidos - solo crear si NO existen
        if (!localStorage.getItem('products')) {
            const products = [
                // Shawarmas (15)
                { id: 1, name: 'Shawarma de Pollo', category: 'Shawarma', ingredients: ['Pollo asado', 'Lechuga', 'Tomate', 'Pepinillos', 'Salsa tahini', 'Pan pita'], price: 6900, available: true, featured: true, tags: ['Popular'] },
                { id: 2, name: 'Shawarma de Cordero', category: 'Shawarma', ingredients: ['Cordero especiado', 'Cebolla morada', 'Perejil', 'Salsa yogurt', 'Pan pita'], price: 7500, available: true, featured: false, tags: ['Picante'] },
                { id: 3, name: 'Shawarma Mixto', category: 'Shawarma', ingredients: ['Pollo y cordero', 'Vegetales mixtos', 'Hummus', 'Salsa especial', 'Pan pita'], price: 7900, available: true, featured: true, tags: ['Clásico'] },
                { id: 4, name: 'Shawarma Vegetariano', category: 'Shawarma', ingredients: ['Berenjenas', 'Pimientos', 'Champiñones', 'Tahini', 'Pan pita'], price: 6500, available: true, featured: false, tags: ['Vegano'] },
                { id: 5, name: 'Shawarma Picante', category: 'Shawarma', ingredients: ['Pollo marinado', 'Jalapeños', 'Salsa picante', 'Cebolla', 'Pan pita'], price: 7200, available: true, featured: false, tags: ['Picante'] },
                { id: 6, name: 'Shawarma Premium', category: 'Shawarma', ingredients: ['Carne premium', 'Queso feta', 'Aceitunas', 'Salsa especial', 'Pan artesanal'], price: 8500, available: true, featured: false, tags: ['Premium'] },
                { id: 7, name: 'Shawarma Light', category: 'Shawarma', ingredients: ['Pechuga de pollo', 'Ensalada verde', 'Yogurt natural', 'Pan integral'], price: 6800, available: true, featured: false, tags: ['Saludable'] },
                { id: 8, name: 'Shawarma Árabe', category: 'Shawarma', ingredients: ['Cordero tradicional', 'Especias árabes', 'Tahini casero', 'Pan pita'], price: 7700, available: true, featured: false, tags: ['Clásico'] },
                { id: 9, name: 'Shawarma BBQ', category: 'Shawarma', ingredients: ['Pollo BBQ', 'Cebolla caramelizada', 'Salsa barbacoa', 'Pan pita'], price: 7300, available: true, featured: false, tags: ['Popular'] },
                { id: 10, name: 'Shawarma Familiar', category: 'Shawarma', ingredients: ['Doble porción de carne', 'Vegetales variados', 'Salsas mixtas', 'Pan grande'], price: 12900, available: true, featured: false, tags: ['Familiar'] },
                { id: 11, name: 'Shawarma Kids', category: 'Shawarma', ingredients: ['Pollo suave', 'Lechuga', 'Queso', 'Salsa suave', 'Pan pequeño'], price: 5500, available: true, featured: false, tags: ['Infantil'] },
                { id: 12, name: 'Shawarma Gourmet', category: 'Shawarma', ingredients: ['Cordero premium', 'Rúcula', 'Queso de cabra', 'Reducción balsámica'], price: 9200, available: true, featured: false, tags: ['Premium'] },
                { id: 13, name: 'Shawarma Mediterráneo', category: 'Shawarma', ingredients: ['Pollo al limón', 'Tomates cherry', 'Albahaca', 'Aceite de oliva'], price: 7600, available: true, featured: false, tags: ['Clásico'] },
                { id: 14, name: 'Shawarma Deluxe', category: 'Shawarma', ingredients: ['Carne seleccionada', 'Vegetales asados', 'Tres salsas', 'Pan artesanal'], price: 8800, available: true, featured: false, tags: ['Premium'] },
                { id: 15, name: 'Shawarma Express', category: 'Shawarma', ingredients: ['Pollo rápido', 'Lechuga', 'Tomate', 'Salsa tahini', 'Pan pita'], price: 6200, available: true, featured: false, tags: ['Rápido'] },
                
                // Falafels (10)
                { id: 16, name: 'Falafel Clásico', category: 'Falafel', ingredients: ['Garbanzos', 'Perejil', 'Cilantro', 'Especias', 'Salsa tahini'], price: 5800, available: true, featured: true, tags: ['2x1', 'Promoción'] },
                { id: 17, name: 'Falafel Picante', category: 'Falafel', ingredients: ['Garbanzos', 'Jalapeños', 'Comino', 'Salsa picante'], price: 6200, available: true, featured: false, tags: ['Picante', 'Vegano'] },
                { id: 18, name: 'Falafel Premium', category: 'Falafel', ingredients: ['Garbanzos orgánicos', 'Hierbas frescas', 'Tahini artesanal'], price: 7100, available: true, featured: false, tags: ['Premium', 'Vegano'] },
                { id: 19, name: 'Falafel Bowl', category: 'Falafel', ingredients: ['Falafels', 'Ensalada', 'Hummus', 'Tabulé', 'Pan pita'], price: 7500, available: true, featured: false, tags: ['Vegano', 'Saludable'] },
                { id: 20, name: 'Falafel Wrap', category: 'Falafel', ingredients: ['Falafels', 'Lechuga', 'Tomate', 'Pepino', 'Tortilla'], price: 6400, available: true, featured: false, tags: ['Vegano'] },
                { id: 21, name: 'Falafel Plate', category: 'Falafel', ingredients: ['6 falafels', 'Hummus', 'Ensalada', 'Pan pita'], price: 8200, available: true, featured: false, tags: ['Vegano'] },
                { id: 22, name: 'Falafel Mini', category: 'Falafel', ingredients: ['3 falafels', 'Salsa', 'Pan pita pequeño'], price: 4500, available: true, featured: false, tags: ['Vegano', 'Sin Gluten'] },
                { id: 23, name: 'Falafel Especial', category: 'Falafel', ingredients: ['Falafels', 'Berenjena', 'Queso feta', 'Tahini'], price: 7800, available: true, featured: false, tags: ['Popular'] },
                { id: 24, name: 'Falafel Familiar', category: 'Falafel', ingredients: ['12 falafels', 'Salsas variadas', 'Pan pita grande'], price: 11500, available: true, featured: false, tags: ['Familiar', 'Vegano'] },
                { id: 25, name: 'Falafel Verde', category: 'Falafel', ingredients: ['Falafels', 'Espinaca', 'Rúcula', 'Salsa verde'], price: 6900, available: true, featured: false, tags: ['Vegano', 'Saludable'] },
                
                // Kebabs (10)
                { id: 26, name: 'Kebab de Pollo', category: 'Kebab', ingredients: ['Pechuga de pollo', 'Pimientos', 'Cebolla', 'Especias', 'Pan árabe'], price: 7200, available: true, featured: false, tags: ['Popular'] },
                { id: 27, name: 'Kebab de Cordero', category: 'Kebab', ingredients: ['Cordero marinado', 'Vegetales asados', 'Salsa yogurt', 'Pan árabe'], price: 8100, available: true, featured: false, tags: ['Clásico'] },
                { id: 28, name: 'Kebab Mixto', category: 'Kebab', ingredients: ['Pollo y cordero', 'Vegetales', 'Salsa especial', 'Pan árabe'], price: 7900, available: true, featured: true, tags: ['2x1','Promoción'] },
                { id: 29, name: 'Kebab Vegetariano', category: 'Kebab', ingredients: ['Vegetales a la parrilla', 'Hummus', 'Tahini', 'Pan integral'], price: 6800, available: true, featured: false, tags: ['Vegano'] },
                { id: 30, name: 'Kebab Picante', category: 'Kebab', ingredients: ['Pollo especiado', 'Jalapeños', 'Salsa harissa', 'Pan árabe'], price: 7500, available: true, featured: false, tags: ['Picante'] },
                { id: 31, name: 'Kebab Premium', category: 'Kebab', ingredients: ['Carne premium', 'Vegetales gourmet', 'Salsa especial', 'Pan artesanal'], price: 9200, available: true, featured: false, tags: ['Premium'] },
                { id: 32, name: 'Kebab Familiar', category: 'Kebab', ingredients: ['Doble carne', 'Vegetales abundantes', 'Salsas mixtas', 'Pan grande'], price: 13500, available: true, featured: false, tags: ['Familiar'] },
                { id: 33, name: 'Kebab Light', category: 'Kebab', ingredients: ['Pechuga magra', 'Ensalada fresca', 'Yogurt', 'Pan integral'], price: 7100, available: true, featured: false, tags: ['Saludable'] },
                { id: 34, name: 'Kebab BBQ', category: 'Kebab', ingredients: ['Pollo BBQ', 'Cebolla', 'Salsa barbacoa', 'Pan árabe'], price: 7600, available: true, featured: false, tags: ['Popular'] },
                { id: 35, name: 'Kebab Deluxe', category: 'Kebab', ingredients: ['Carne selecta', 'Vegetales premium', 'Tres salsas', 'Pan artesanal'], price: 8900, available: true, featured: false, tags: ['Premium'] },
                
                // Salsas (5)
                { id: 36, name: 'Salsa Tahini', category: 'Salsa', ingredients: ['Semillas de sésamo', 'Limón', 'Ajo', 'Aceite de oliva'], price: 1500, available: true, featured: false, tags: ['Clásica'] },
                { id: 37, name: 'Salsa Yogurt', category: 'Salsa', ingredients: ['Yogurt natural', 'Pepino', 'Menta', 'Ajo'], price: 1500, available: true, featured: false, tags: ['Suave'] },
                { id: 38, name: 'Salsa Picante', category: 'Salsa', ingredients: ['Chiles rojos', 'Ajo', 'Vinagre', 'Especias'], price: 1500, available: true, featured: false, tags: ['Picante'] },
                { id: 39, name: 'Hummus', category: 'Salsa', ingredients: ['Garbanzos', 'Tahini', 'Limón', 'Ajo'], price: 2500, available: true, featured: false, tags: ['Popular'] },
                { id: 40, name: 'Salsa Ajo', category: 'Salsa', ingredients: ['Ajo', 'Mayonesa', 'Limón', 'Sal'], price: 1500, available: true, featured: false, tags: ['Intensa'] },
                
                // Bebidas (10)
                { id: 41, name: 'Coca Cola', category: 'Bebida', ingredients: ['Bebida gasificada'], price: 1500, available: true, featured: false, tags: ['Refrescante'] },
                { id: 42, name: 'Coca Cola Zero', category: 'Bebida', ingredients: ['Bebida gasificada sin azúcar'], price: 1500, available: true, featured: false, tags: ['Light'] },
                { id: 43, name: 'Fanta', category: 'Bebida', ingredients: ['Bebida gasificada sabor naranja'], price: 1500, available: true, featured: false, tags: ['Refrescante'] },
                { id: 44, name: 'Sprite', category: 'Bebida', ingredients: ['Bebida gasificada sabor limón'], price: 1500, available: true, featured: false, tags: ['Refrescante'] },
                { id: 45, name: 'Agua Mineral', category: 'Bebida', ingredients: ['Agua mineral natural'], price: 1200, available: true, featured: false, tags: ['Natural'] },
                { id: 46, name: 'Agua con Gas', category: 'Bebida', ingredients: ['Agua mineral gasificada'], price: 1200, available: true, featured: false, tags: ['Natural'] },
                { id: 47, name: 'Jugo Natural Naranja', category: 'Bebida', ingredients: ['Jugo de naranja recién exprimido'], price: 2500, available: true, featured: false, tags: ['Natural'] },
                { id: 48, name: 'Limonada', category: 'Bebida', ingredients: ['Limón', 'Agua', 'Azúcar', 'Hierbabuena'], price: 2200, available: true, featured: false, tags: ['Refrescante'] },
                { id: 49, name: 'Té Helado', category: 'Bebida', ingredients: ['Té negro', 'Limón', 'Hielo'], price: 2000, available: true, featured: false, tags: ['Refrescante'] },
                { id: 50, name: 'Ayran', category: 'Bebida', ingredients: ['Yogurt', 'Agua', 'Sal', 'Menta'], price: 2300, available: true, featured: false, tags: ['Tradicional'] }
            ];            
            localStorage.setItem('products', JSON.stringify(products));
        }

        // Inicializar otras estructuras
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }

        if (!localStorage.getItem('session')) {
            localStorage.setItem('session', JSON.stringify({ currentUser: null, lastActivity: null }));
        }

        if (!localStorage.getItem('recoveryTokens')) {
            localStorage.setItem('recoveryTokens', JSON.stringify([]));
        }

        if (!localStorage.getItem('nextOrderId')) {
            localStorage.setItem('nextOrderId', '1024');
        }
    }

    // Obtener usuarios
    static getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    // Guardar usuarios
    static saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Obtener productos
    static getProducts() {
        return JSON.parse(localStorage.getItem('products') || '[]');
    }

    // Obtener órdenes
    static getOrders() {
        return JSON.parse(localStorage.getItem('orders') || '[]');
    }

    // Guardar órdenes
    static saveOrders(orders) {
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    // Obtener sesión actual
    static getSession() {
        return JSON.parse(localStorage.getItem('session') || '{"currentUser":null}');
    }

    // Guardar sesión
    static saveSession(session) {
        localStorage.setItem('session', JSON.stringify(session));
    }

    // Obtener carrito del usuario actual
    static getCart() {
        const session = this.getSession();
        if (!session.currentUser) return { items: [] };
        const cartKey = `cart_${session.currentUser.id}`;
        return JSON.parse(localStorage.getItem(cartKey) || '{"items":[]}');
    }

    // Guardar carrito
    static saveCart(cart) {
        const session = this.getSession();
        if (!session.currentUser) return;
        const cartKey = `cart_${session.currentUser.id}`;
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }

    // Limpiar carrito
    static clearCart() {
        const session = this.getSession();
        if (!session.currentUser) return;
        const cartKey = `cart_${session.currentUser.id}`;
        localStorage.removeItem(cartKey);
    }

    // Obtener siguiente ID de orden
    static getNextOrderId() {
        const id = parseInt(localStorage.getItem('nextOrderId') || '1024');
        localStorage.setItem('nextOrderId', (id + 1).toString());
        return id;
    }
}

// Inicializar storage al cargar el script
if (typeof window !== 'undefined') {
    StorageManager.init();
}