// src/config/data.js
// Datos extraídos de core/js/storage.js

export const defaultUsers = [
    {
        email: 'correo@example.com',
        password: 'Elpepe2025', // Recuerda: Mongoose hasheará esto!
        name: 'Juan Pérez',
        rut: '12.345.678-9',
        address: 'Av. Central 123',
        phone: '+56 9 8667 2450',
        birthdate: '1990-05-15',
        gender: 'Hombre',
        role: 'customer'
    },
    {
        email: 'admin@alsahara.cl',
        password: 'Admin2025',
        name: 'Administrador',
        role: 'admin'
    },
    {
        email: 'cajero@alsahara.cl',
        password: 'Cajero2025',
        name: 'Cajero Virtual',
        role: 'cashier'
    }
];

export const products = [
    // Shawarmas (5)
    { 
        name: 'Shawarma de Pollo', 
        category: 'Shawarma', 
        image: 'https://fishandmeat.hk/wp-content/uploads/2025/05/arabic-chicken-shawarma-sandwich-recipe-1747792750.jpg',
        ingredients: ['Pollo asado', 'Lechuga', 'Tomate', 'Pepinillos', 'Salsa tahini', 'Pan pita'], 
        price: 6900, 
        available: true, 
        featured: true, 
        tags: ['Popular'] 
    },
    // ... (Copia el resto de los 20 productos de storage.js)
    { 
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