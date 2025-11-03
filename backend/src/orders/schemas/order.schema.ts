import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  orderNumber: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop({ type: [OrderItem], default: [] })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  tax: number;

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  paymentMethod: string; // Tarjeta, Efectivo, Transferencia

  @Prop({ default: 'Pendiente' })
  paymentStatus: string; // Pendiente, Pagado, Rechazado

  @Prop({ default: 'Pendiente' })
  orderStatus: string; // Pendiente, En preparación, En camino, Entregado, Cancelado

  @Prop({ required: true })
  deliveryType: string; // Delivery, Retiro en tienda

  @Prop()
  estimatedTime: number; // minutos

  @Prop()
  receiptUrl: string;

  @Prop({ type: [Object], default: [] })
  notifications: any[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
