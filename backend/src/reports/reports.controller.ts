import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales/monthly')
  async getMonthlySalesReport(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.reportsService.getMonthlySalesReport(
      parseInt(year),
      parseInt(month),
    );
  }

  @Get('sales/yearly')
  async getYearlySalesReport(@Query('year') year: string) {
    return this.reportsService.getYearlySalesReport(parseInt(year));
  }

  @Get('sales/custom')
  async getCustomRangeReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getCustomRangeReport(startDate, endDate);
  }
}
