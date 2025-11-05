// src/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Conectado');
    } catch (err) {
        console.error('❌ Error de conexión a MongoDB:', err.message);
        process.exit(1); // Sale del proceso con error
    }
};

export default connectDB;