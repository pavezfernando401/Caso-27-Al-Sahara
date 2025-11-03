import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class ReportsService {
  constructor(private readonly ordersService: OrdersService) {}

  async getMonthlySalesReport(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return this.ordersService.getSalesReport(startDate, endDate);
  }

  async getYearlySalesReport(year: number) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    return this.ordersService.getSalesReport(startDate, endDate);
  }

  async getCustomRangeReport(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    return this.ordersService.getSalesReport(start, end);
  }
}
