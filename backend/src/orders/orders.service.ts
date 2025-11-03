import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto, userInfo: any): Promise<Order> {
    // Generar número de orden
    const orderCount = await this.orderModel.countDocuments();
    const orderNumber = `#${1024 + orderCount}`;

    // Calcular tiempo estimado
    const estimatedTime = createOrderDto.deliveryType === 'Retiro en tienda' ? 15 : 35;

    // Determinar estado de pago inicial
    let paymentStatus = 'Pendiente';
    if (createOrderDto.paymentMethod === 'Tarjeta') {
      paymentStatus = 'Pagado';
    } else if (createOrderDto.paymentMethod === 'Efectivo') {
      paymentStatus = 'Pago a la entrega';
    } else if (createOrderDto.paymentMethod === 'Transferencia') {
      paymentStatus = 'Pendiente de comprobante';
    }

    const newOrder = new this.orderModel({
      ...createOrderDto,
      userId,
      orderNumber,
      customerName: userInfo.name,
      customerEmail: userInfo.email,
      estimatedTime,
      paymentStatus,
      orderStatus: 'Pendiente',
    });

    return newOrder.save();
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().populate('userId', '-password').exec();
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).populate('userId', '-password').exec();
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }
    return order;
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      updateStatusDto,
      { new: true },
    ).exec();

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async getPendingOrders(): Promise<Order[]> {
    return this.orderModel.find({ 
      paymentStatus: { $ne: 'Pagado' } 
    }).sort({ createdAt: 1 }).exec();
  }

  async getPaidOrders(): Promise<Order[]> {
    return this.orderModel.find({ 
      paymentStatus: 'Pagado' 
    }).sort({ createdAt: 1 }).exec();
  }

  async getOrdersByPaymentMethod(method: string): Promise<Order[]> {
    return this.orderModel.find({ paymentMethod: method }).exec();
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.findById(id);
    
    if (order.orderStatus === 'Entregado') {
      throw new BadRequestException('No se puede cancelar una orden ya entregada');
    }

    order.orderStatus = 'Cancelado';
    return await order.save();
  }

  async getSalesReport(startDate: Date, endDate: Date) {
    const orders = await this.orderModel.find({
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'Pagado',
    }).exec();

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = orders.length;

    // Productos más vendidos
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        productSales[item.productName].quantity += item.quantity;
        productSales[item.productName].revenue += item.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales).sort((a: any, b: any) => b.quantity - a.quantity);

    return {
      period: { startDate, endDate },
      totalSales,
      orderCount,
      averageOrderValue: orderCount > 0 ? totalSales / orderCount : 0,
      topProducts,
    };
  }
}
