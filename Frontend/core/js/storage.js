class StorageManager {
    static init() {
        // Usuarios predefinidos con diferentes roles
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

        // Productos predefinidos con imágenes random 
        if (!localStorage.getItem('products')) {
            const products = [
                // Shawarmas (5)
                { 
                    id: 1, 
                    name: 'Shawarma de Pollo', 
                    category: 'Shawarma', 
                    image: 'https://fishandmeat.hk/wp-content/uploads/2025/05/arabic-chicken-shawarma-sandwich-recipe-1747792750.jpg',
                    ingredients: ['Pollo asado', 'Lechuga', 'Tomate', 'Pepinillos', 'Salsa tahini', 'Pan pita'], 
                    price: 6900, 
                    available: true, 
                    featured: true, 
                    tags: ['Popular'] 
                },
                { 
                    id: 2, 
                    name: 'Shawarma de Cordero', 
                    category: 'Shawarma', 
                    image: 'https://www.simplyquinoa.com/wp-content/uploads/2023/05/chicken-shawarma-gyros-9.jpg',
                    ingredients: ['Cordero especiado', 'Cebolla morada', 'Perejil', 'Salsa yogurt', 'Pan pita'], 
                    price: 7500, 
                    available: true, 
                    featured: false, 
                    tags: ['Picante'] 
                },
                { 
                    id: 3, 
                    name: 'Shawarma Mixto', 
                    category: 'Shawarma', 
                    image: 'https://www.bekiacocina.com/images/cocina/0000/184-h.jpg',
                    ingredients: ['Pollo y cordero', 'Vegetales mixtos', 'Hummus', 'Salsa especial', 'Pan pita'], 
                    price: 7900, 
                    available: true, 
                    featured: true, 
                    tags: ['Clásico'] 
                },
                { 
                    id: 4, 
                    name: 'Shawarma Vegetariano', 
                    category: 'Shawarma', 
                    image: 'https://mrkebab.cl/wp-content/uploads/2021/11/SHAWARMA-DE-FALAFEL.jpg',
                    ingredients: ['Berenjenas', 'Pimientos', 'Champiñones', 'Tahini', 'Pan pita'], 
                    price: 6500, 
                    available: true, 
                    featured: false, 
                    tags: ['Vegano'] 
                },
                { 
                    id: 5, 
                    name: 'Shawarma Premium', 
                    category: 'Shawarma', 
                    image: 'https://imag.bonviveur.com/shawarma-de-pollo.jpg',
                    ingredients: ['Carne premium', 'Queso feta', 'Aceitunas', 'Salsa especial', 'Pan artesanal'], 
                    price: 8500, 
                    available: true, 
                    featured: false, 
                    tags: ['Premium'] 
                },
                
                // Falafels (5)
                { 
                    id: 6, 
                    name: 'Falafel Clásico', 
                    category: 'Falafel', 
                    image: 'https://imag.bonviveur.com/falafel-recien-hechos.jpg',
                    ingredients: ['Garbanzos', 'Perejil', 'Cilantro', 'Especias', 'Salsa Tahini'], 
                    price: 5800, 
                    available: true, 
                    featured: true, 
                    tags: ['2x1','Promoción']  
                },
                { 
                    id: 7, 
                    name: 'Falafel Picante', 
                    category: 'Falafel', 
                    image: 'https://images.cookforyourlife.org/wp-content/uploads/2022/06/Baked_Falafel.png',
                    ingredients: ['Garbanzos', 'Jalapeños', 'Comino', 'Salsa picante'], 
                    price: 6200, 
                    available: true, 
                    featured: false, 
                    tags: ['Picante', 'Vegano'] 
                },
                { 
                    id: 8, 
                    name: 'Falafel Bowl', 
                    category: 'Falafel', 
                    image: 'https://www.realsimple.com/thmb/NFIGTxuGlJTsfKdUmyGOwyhB2M4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/1023COO-falafel-bites-ad6de43586164252ab670be6b5ad4750.jpg',
                    ingredients: ['Falafels', 'Ensalada', 'Hummus', 'Tabulé', 'Pan pita'], 
                    price: 7500, 
                    available: true, 
                    featured: false, 
                    tags: ['Vegano', 'Saludable'] 
                },
                { 
                    id: 9, 
                    name: 'Falafel Wrap', 
                    category: 'Falafel', 
                    image: 'https://cookingwithayeh.com/wp-content/uploads/2024/03/Falafel-Wrap-SQ-1.jpg',
                    ingredients: ['Falafels', 'Lechuga', 'Tomate', 'Pepino', 'Tortilla'], 
                    price: 6400, 
                    available: true, 
                    featured: false, 
                    tags: ['Vegano'] 
                },
                { 
                    id: 10, 
                    name: 'Falafel Plate', 
                    category: 'Falafel', 
                    image: 'https://thishealthykitchen.com/wp-content/uploads/2020/04/Baked-Falafel-Wraps-Feat-Image-Square.jpg',
                    ingredients: ['6 falafels', 'Hummus', 'Ensalada', 'Pan pita'], 
                    price: 8200, 
                    available: true, 
                    featured: false, 
                    tags: ['Vegano'] 
                },
                
                // Kebabs (5)
                { 
                    id: 11, 
                    name: 'Kebab de Pollo', 
                    category: 'Kebab', 
                    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&h=300&fit=crop',
                    ingredients: ['Pechuga de pollo', 'Pimientos', 'Cebolla', 'Especias', 'Pan árabe'], 
                    price: 7200, 
                    available: true, 
                    featured: false, 
                    tags: ['Popular'] 
                },
                { 
                    id: 12, 
                    name: 'Kebab de Cordero', 
                    category: 'Kebab', 
                    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=400&h=300&fit=crop',
                    ingredients: ['Cordero marinado', 'Vegetales asados', 'Salsa yogurt', 'Pan árabe'], 
                    price: 8100, 
                    available: true, 
                    featured: false, 
                    tags: ['Clásico'] 
                },
                { 
                    id: 13, 
                    name: 'Kebab Mixto', 
                    category: 'Kebab', 
                    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=400&h=300&fit=crop',
                    ingredients: ['Pollo y cordero', 'Vegetales', 'Salsa especial', 'Pan árabe'], 
                    price: 7900, 
                    available: true, 
                    featured: true, 
                    tags: ['2x1','Promoción'] 
                },
                { 
                    id: 14, 
                    name: 'Kebab Vegetariano', 
                    category: 'Kebab', 
                    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&h=300&fit=crop',
                    ingredients: ['Vegetales a la parrilla', 'Hummus', 'Tahini', 'Pan integral'], 
                    price: 6800, 
                    available: true, 
                    featured: false, 
                    tags: ['Vegano'] 
                },
                { 
                    id: 15, 
                    name: 'Kebab Premium', 
                    category: 'Kebab', 
                    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?q=80&w=400&h=300&fit=crop',
                    ingredients: ['Carne premium', 'Vegetales gourmet', 'Salsa especial', 'Pan artesanal'], 
                    price: 9200, 
                    available: true, 
                    featured: false, 
                    tags: ['Premium'] 
                },
                
                // Salsas (2)
                { 
                    id: 16, 
                    name: 'Salsa Tahini', 
                    category: 'Salsa', 
                    image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?q=80&w=400&h=300&fit=crop',
                    ingredients: ['Semillas de sésamo', 'Limón', 'Ajo', 'Aceite de oliva'], 
                    price: 1500, 
                    available: true, 
                    featured: false, 
                    tags: ['Clásica'] 
                },
                { 
                    id: 17, 
                    name: 'Hummus', 
                    category: 'Salsa', 
                    image: 'https://www.gourmet.cl/wp-content/uploads/2016/09/Hummus.jpg',
                    ingredients: ['Garbanzos', 'Tahini', 'Limón', 'Ajo'], 
                    price: 2500, 
                    available: true, 
                    featured: false, 
                    tags: ['Popular'] 
                },
                
                // Bebidas (3)
                { 
                    id: 18, 
                    name: 'Coca Cola', 
                    category: 'Bebida', 
                    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=400&h=300&fit=crop',
                    ingredients: ['Bebida gasificada'], 
                    price: 1500, 
                    available: true, 
                    featured: false, 
                    tags: ['Refrescante'] 
                },
                { 
                    id: 19, 
                    name: 'Agua Mineral', 
                    category: 'Bebida', 
                    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?q=80&w=400&h=300&fit=crop',
                    ingredients: ['Agua mineral natural'], 
                    price: 1200, 
                    available: true, 
                    featured: false, 
                    tags: ['Natural'] 
                },
                { 
                    id: 20, 
                    name: 'Jugo Natural Naranja', 
                    category: 'Bebida', 
                    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=400&h=300&fit=crop',
                    ingredients: ['Jugo de naranja recién exprimido'], 
                    price: 2500, 
                    available: true, 
                    featured: false, 
                    tags: ['Natural'] 
                }
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