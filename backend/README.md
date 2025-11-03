# AlSahara Backend - NestJS + MongoDB

## 🚀 Instalación y Configuración

### 1. Verificar que Node.js esté instalado
```bash
node --version
npm --version
```

### 2. Instalar dependencias
```bash
cd backend
npm install
```

### 3. Configurar MongoDB

#### Opción A: MongoDB Local
- Asegúrate de que MongoDB esté corriendo localmente
- La URI por defecto es: `mongodb://localhost:27017/alsahara`

#### Opción B: MongoDB Atlas (Cloud)
1. Ve a: https://www.mongodb.com/cloud/atlas
2. Crea un cluster gratuito (M0)
3. Obtén tu connection string
4. Edita el archivo `.env` y reemplaza `MONGODB_URI`

### 4. Configurar Variables de Entorno

Edita el archivo `.env` y ajusta según necesites:

```env
# MongoDB (Elige una opción)
# Local:
MONGODB_URI=mongodb://localhost:27017/alsahara

# Atlas (ejemplo):
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/alsahara

# JWT
JWT_SECRET=cambia_este_secret_por_uno_seguro
JWT_EXPIRES_IN=7d

# Server
PORT=3001

# CORS
CORS_ORIGIN=http://localhost:5500,http://127.0.0.1:5500
```

### 5. Compilar TypeScript
```bash
npm run build
```

### 6. Poblar Base de Datos (Seed)
```bash
npm run seed
```

Esto creará:
- Usuario Admin: `admin@alsahara.cl` / `Admin123`
- Usuario Cajero: `cajero@alsahara.cl` / `Cajero123`
- 8 productos de ejemplo (Kebabs, Shawarmas, Falafels)

### 7. Iniciar el Servidor

#### Modo Desarrollo (con auto-reload):
```bash
npm run start:watch
```

#### Modo Producción:
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3001`

---

## 📚 Endpoints de la API

### Autenticación

#### Registro Simple
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "Cliente123",
  "name": "Juan Pérez",
  "address": "Av. Libertador 123",
  "phone": "+56912345678"
}
```

#### Registro Completo
```http
POST /api/auth/register-full
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "Cliente123",
  "name": "Juan Pérez",
  "rut": "12.345.678-9",
  "address": "Av. Libertador 123",
  "phone": "+56912345678",
  "birthdate": "1990-01-01",
  "gender": "Masculino"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "cliente@example.com",
  "password": "Cliente123"
}
```

Respuesta:
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Inicio de sesión exitoso"
}
```

### Usuarios

#### Obtener Perfil (requiere autenticación)
```http
GET /api/users/profile
Authorization: Bearer {token}
```

#### Actualizar Perfil
```http
PUT /api/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nuevo Nombre",
  "address": "Nueva Dirección"
}
```

### Productos

#### Listar Todos los Productos
```http
GET /api/products
```

#### Buscar por Categoría
```http
GET /api/products?category=Kebab
GET /api/products?category=Shawarma
GET /api/products?category=Falafel
```

#### Buscar por Texto
```http
GET /api/products?search=pollo
```

#### Productos Destacados
```http
GET /api/products/featured
```

#### Ver Detalle de Producto
```http
GET /api/products/{id}
```

#### Crear Producto (requiere rol admin)
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Kebab Especial",
  "description": "Descripción del producto",
  "price": 7000,
  "category": "Kebab",
  "stock": 50,
  "featured": true,
  "tags": ["Picante"]
}
```

### Órdenes

#### Crear Orden (requiere autenticación)
```http
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": "65abc...",
      "productName": "Kebab de Pollo",
      "quantity": 2,
      "price": 6500
    }
  ],
  "subtotal": 13000,
  "tax": 2470,
  "total": 15470,
  "paymentMethod": "Tarjeta",
  "deliveryType": "Delivery",
  "address": "Av. Libertador 123",
  "phone": "+56912345678"
}
```

#### Ver Mis Órdenes
```http
GET /api/orders
Authorization: Bearer {token}
```

#### Rastrear Orden
```http
GET /api/orders/{id}/track
Authorization: Bearer {token}
```

#### Cancelar Orden
```http
PUT /api/orders/{id}/cancel
Authorization: Bearer {token}
```

### Cajero (requiere rol cashier o admin)

#### Listar Órdenes del Cajero
```http
GET /api/cashier/orders
Authorization: Bearer {token}
```

Filtros disponibles:
- `?filter=card` - Pagos con tarjeta
- `?filter=cash` - Pagos en efectivo
- `?filter=transfer` - Transferencias
- `?filter=pending` - Pagos pendientes

#### Procesar Venta
```http
PUT /api/cashier/orders/{id}/process
Authorization: Bearer {token}
```

### Reportes (requiere rol admin)

#### Reporte Mensual
```http
GET /api/reports/sales/monthly?year=2025&month=1
Authorization: Bearer {token}
```

#### Reporte Anual
```http
GET /api/reports/sales/yearly?year=2025
Authorization: Bearer {token}
```

#### Reporte Rango Personalizado
```http
GET /api/reports/sales/custom?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer {token}
```

---

## 🔐 Roles de Usuario

- **customer**: Cliente normal (puede hacer pedidos)
- **cashier**: Cajero virtual (puede procesar ventas)
- **admin**: Administrador (acceso total)

---

## 🛠️ Scripts Disponibles

```bash
# Compilar TypeScript
npm run build

# Iniciar servidor (producción)
npm start

# Iniciar con auto-reload (desarrollo)
npm run start:watch

# Iniciar con ts-node
npm run start:dev

# Poblar base de datos
npm run seed
```

---

## 📝 Notas Importantes

1. **CORS**: El backend acepta peticiones desde `http://localhost:5500` y `http://127.0.0.1:5500`. Si usas otro puerto para tu frontend, actualiza `CORS_ORIGIN` en `.env`

2. **JWT Token**: Guarda el token que recibes al hacer login y envíalo en el header `Authorization: Bearer {token}` en las peticiones protegidas

3. **Validaciones**: El backend valida automáticamente los datos de entrada según los DTOs definidos

4. **Timestamps**: Todos los documentos tienen `createdAt` y `updatedAt` automáticos

---

## ✅ Checklist de Instalación

- [ ] Node.js instalado (v18 o superior)
- [ ] MongoDB instalado o cuenta de Atlas creada
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] MongoDB corriendo (si es local)
- [ ] Código compilado (`npm run build`)
- [ ] Base de datos poblada (`npm run seed`)
- [ ] Servidor iniciado (`npm run start:watch`)

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"
- Verifica que MongoDB esté corriendo (si es local)
- Verifica que la URI en `.env` sea correcta
- Si usas Atlas, verifica que tu IP esté en la whitelist

### Error: "Port 3001 already in use"
- Cambia el puerto en `.env`
- O detén el proceso que está usando el puerto 3001

### Error: "Module not found"
- Ejecuta `npm install` nuevamente
- Verifica que estés en la carpeta `backend/`

---

## 📞 Usuarios de Prueba

Después de ejecutar `npm run seed`:

**Admin:**
- Email: `admin@alsahara.cl`
- Password: `Admin123`

**Cajero:**
- Email: `cajero@alsahara.cl`
- Password: `Cajero123`

---

¡Backend listo para usar! 🎉
