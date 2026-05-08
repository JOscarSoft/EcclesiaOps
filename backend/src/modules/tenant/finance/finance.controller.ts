import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('categories')
  @RequirePermissions('VIEW_FINANCE')
  getCategories(@Query('type') type: string) {
    return this.financeService.findAllCategories(type);
  }

  @Post('categories')
  @RequirePermissions('MANAGE_FINANCE')
  createCategory(@Req() req: any, @Body() data: any) {
    return this.financeService.createCategory({ ...data, church: req.user.churchId || data.church });
  }

  @Get('transactions')
  @RequirePermissions('VIEW_FINANCE')
  findAll(@Req() req: any, @Query() filters: any) {
    return this.financeService.findAllTransactions(req.user.churchId, filters);
  }

  @Post('transactions')
  @RequirePermissions('MANAGE_FINANCE')
  create(@Req() req: any, @Body() data: any) {
    return this.financeService.createTransaction({ 
      ...data, 
      createdBy: req.user.userId, 
      church: req.user.churchId || data.church 
    });
  }

  @Delete('transactions/:id')
  @RequirePermissions('MANAGE_FINANCE')
  remove(@Param('id') id: string) {
    return this.financeService.removeTransaction(id);
  }

  @Get('stats/balance')
  @RequirePermissions('VIEW_FINANCE')
  getBalance(@Req() req: any, @Query('month') month: number, @Query('year') year: number, @Query('church') churchId: string) {
    return this.financeService.getBalance(month, year, churchId || req.user.churchId);
  }
}
