// src/seeder.js
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import { defaultUsers, products } from './config/data.js';
import bcrypt from 'bcryptjs'; // <-- ¡IMPORTAR BCYPT!

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();
        
        console.log('🗑️ Datos existentes eliminados.');

        // -----------------------------------------------------
        // PASO CLAVE: Hashear contraseñas manualmente para el seeding
        // -----------------------------------------------------
        const salt = await bcrypt.genSalt(10);
        const seededUsers = [];
        
        for (const user of defaultUsers) {
            const hashedPassword = await bcrypt.hash(user.password, salt);
            seededUsers.push({
                ...user,
                password: hashedPassword // Reemplazar la contraseña de texto plano por el hash
            });
        }
        
        // -----------------------------------------------------
        
        await User.insertMany(seededUsers); // Insertar los usuarios con la contraseña hasheada
        console.log('👥 Usuarios insertados correctamente.');
        
        await Product.insertMany(products);
        console.log('🍔 Productos insertados correctamente.');
        
        console.log('✅ Proceso de Seeding completado con éxito.');
        process.exit();

    } catch (error) {
        console.error(`❌ Error en el Seeding: ${error.message}`);
        process.exit(1);
    }
};

// ... (resto del código data:destroy)

const destroyData = async () => {
    try {
        await User.deleteMany();
        await Product.deleteMany();
        console.log('🗑️ Datos destruidos.');
        process.exit();
    } catch (error) {
        console.error(`❌ Error al destruir datos: ${error.message}`);
        process.exit(1);
    }
};

// Ejecutar el script (usando argumentos de línea de comandos)
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}