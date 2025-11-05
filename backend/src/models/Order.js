import mongoose from 'mongoose';

// Sub-esquema para los items del pedido
const OrderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String }
}, { _id: false });

// Sub-esquema para las notificaciones
const NotificationSchema = new mongoose.Schema({
    status: { type: String },
    sentAt: { type: Date, default: Date.now },
    message: { type: String }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String },
    customerEmail: { type: String },
    address: { type: String },
    phone: { type: String },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ['Pagado', 'Pago a la entrega', 'Pendiente de comprobante', 'Pendiente', 'Reembolso Pendiente'], default: 'Pendiente' },
    orderStatus: { type: String, enum: ['Pendiente', 'En preparación', 'En camino', 'Entregado', 'Cancelado'], default: 'Pendiente' },
    deliveryType: { type: String, enum: ['Entrega', 'Retiro en tienda'] },
    estimatedTime: { type: Number },
    receiptUrl: { type: String },
    notifications: [NotificationSchema],
    cancelReason: { type: String }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);