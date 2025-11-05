// src/index.js
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config();

// 1. Conectar a la base de datos
connectDB();

// 2. Función de autenticación para el Context
const getUser = async (token) => {
    if (!token) return null;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        return user;
    } catch (error) {
        console.error('Error verifying token:', error.message);
        return null; // Token inválido o expirado
    }
};

// 3. Configurar Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// 4. Iniciar el servidor
const startServer = async () => {
    const { url } = await startStandaloneServer(server, {
        listen: { port: process.env.PORT || 4000 },
        context: async ({ req }) => {
            // Obtener el token del header Authorization
            const token = req.headers.authorization || '';
            const user = await getUser(token.replace('Bearer ', ''));
            
            // Retornar el usuario para que esté disponible en los resolvers
            return { user };
        },
    });

    console.log(`🚀 Servidor GraphQL listo en: ${url}`);
};

startServer();