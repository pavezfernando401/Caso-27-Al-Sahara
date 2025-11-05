// src/graphql/typeDefs.js
import gql from 'graphql-tag';

const typeDefs = gql`
    # Tipos Principales
    type User {
        id: ID!
        name: String!
        email: String!
        role: String!
        address: String
        phone: String
        createdAt: String
    }

    type Product {
        id: ID!
        name: String!
        category: String!
        price: Float!
        available: Boolean!
        ingredients: [String]
        featured: Boolean
    }

    type CartItem {
        productId: ID!
        name: String!
        quantity: Int!
        price: Float!
            image: String
        }

    type Order {
        id: ID!
        customerName: String!
        customerEmail: String!
        items: [CartItem!]!
        paymentMethod: String!
        paymentStatus: String!
        orderStatus: String!
            orderNumber: String!
            subtotal: Float!
            tax: Float!
            total: Float!
            notifications: [Notification]
            deliveryType: String
            estimatedTime: Int
        createdAt: String!
    }

        type Notification {
            status: String
            sentAt: String
            message: String
        }

    type AuthPayload {
        user: User!
        token: String!
    }
    
    # Consultas (READ)
    type Query {
        # Autenticación y Perfil
        me: User
        
        # Productos
        products(category: String, search: String): [Product!]!
        product(id: ID!): Product
        
        # Pedidos
        orders(status: String): [Order!]!
        order(id: ID!): Order
    }
    
    # Mutaciones (WRITE)
    type Mutation {
        # Autenticación
        register(name: String!, email: String!, password: String!, address: String, phone: String): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
        
        # Productos (Admin/Cajero)
        createProduct(name: String!, category: String!, price: Float!, ingredients: [String!]): Product!
        updateProductAvailability(id: ID!, available: Boolean!): Product!
        
        # Pedidos (Cliente)
        createOrder(items: [OrderItemInput!]!, paymentMethod: String!, deliveryType: String!): Order!
        cancelOrder(id: ID!, reason: String): Order!
            updateOrderStatus(id: ID!, newStatus: String!): Order!
    }

    # Inputs (para mutaciones)
    input OrderItemInput {
        productId: ID!
        quantity: Int!
    }
`;

export default typeDefs;