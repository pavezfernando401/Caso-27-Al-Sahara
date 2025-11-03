import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class CashierService {
  constructor(private readonly ordersService: OrdersService) {}

  async getOrdersByFilter(filter: string) {
    switch (filter) {
      case 'card':
        return this.ordersService.getOrdersByPaymentMethod('Tarjeta');
      case 'transfer':
        return this.ordersService.getOrdersByPaymentMethod('Transferencia');
      case 'cash':
        return this.ordersService.getOrdersByPaymentMethod('Efectivo');
      case 'pending':
        return this.ordersService.getPendingOrders();
      default:
        return this.ordersService.findAll();
    }
  }

  async processSale(orderId: string) {
    return this.ordersService.updateStatus(orderId, {
      paymentStatus: 'Pagado',
      orderStatus: 'En preparación',
    });
  }

  async getPendingPayments() {
    return this.ordersService.getPendingOrders();
  }
}
