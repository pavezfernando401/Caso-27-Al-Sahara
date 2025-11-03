import { Controller, Get, Put, Param, Query, UseGuards } from '@nestjs/common';
import { CashierService } from './cashier.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/cashier')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cashier', 'admin')
export class CashierController {
  constructor(private readonly cashierService: CashierService) {}

  @Get('orders')
  async getOrders(@Query('filter') filter?: string) {
    return this.cashierService.getOrdersByFilter(filter || 'all');
  }

  @Get('orders/pending')
  async getPendingPayments() {
    return this.cashierService.getPendingPayments();
  }

  @Put('orders/:id/process')
  async processSale(@Param('id') id: string) {
    return this.cashierService.processSale(id);
  }
}
