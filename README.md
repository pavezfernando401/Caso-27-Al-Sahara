# 🍽️ Al Sahara - Restaurante de Comida Árabe

Una aplicación web completa para pedidos de comida árabe con sistema de gestión para administradores y cajeros.

## 🚀 Demo Online

- **Sitio Web**: [https://pavezfernando401.github.io/Caso-27-Al-Sahara/](https://pavezfernando401.github.io/Caso-27-Al-Sahara/)
- **API Backend**: [URL del backend se actualizará]

## 📋 Características

### Para Clientes:
- 🍕 Catálogo de productos (Kebabs, Shawarmas, Falafels)
- 🛒 Carrito de compras
- 👤 Registro y login de usuarios
- 📱 Diseño responsive
- 🔍 Filtros y búsqueda de productos

### Para Administradores:
- 📊 Panel de administración
- 📈 Reportes de ventas
- 👥 Gestión de usuarios
- 📦 Gestión de productos

### Para Cajeros:
- 💰 Sistema de caja
- 📋 Gestión de pedidos
- ✅ Procesamiento de órdenes

## 🛠️ Tecnologías

### Frontend:
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5
- Font Awesome

### Backend:
- Node.js
- NestJS
- MongoDB Atlas
- JWT Authentication
- bcrypt

## 🔐 Credenciales de Prueba

- **Admin**: admin@alsahara.com / admin123
- **Cajero**: cajero@alsahara.com / cajero123

## 📁 Estructura del Proyecto

```
AlSahara caso 27/
├── backend/                 # Servidor NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación JWT
│   │   ├── users/          # Gestión de usuarios
│   │   ├── products/       # Catálogo de productos
│   │   ├── orders/         # Sistema de pedidos
│   │   └── reports/        # Reportes y estadísticas
│   └── package.json
├── Frontend/               # Aplicación web
│   ├── core/              # Utilidades y API
│   ├── b01-registro/      # Registro de usuarios
│   ├── b02-login/         # Inicio de sesión
│   ├── b07-catalog/       # Catálogo de productos
│   ├── b19-cashier/       # Panel de cajero
│   └── b22-reports/       # Reportes de admin
└── index.html             # Página principal
```

## 🚀 Instalación Local

### Backend:
```bash
cd backend
npm install
npm run start:dev
```

### Frontend:
```bash
cd Frontend
npx http-server -p 8080
```

## 🌟 Autor

**Fernando Pavez**
- GitHub: [@pavezfernando401](https://github.com/pavezfernando401)

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.