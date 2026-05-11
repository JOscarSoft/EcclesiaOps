import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CreateFinanceCategoryDto } from './dto/create-category.dto';
import { CreateFinanceTransactionDto } from './dto/create-transaction.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) { }

  @Get('categories')
  @RequirePermissions('VIEW_FINANCE')
  @ApiOperation({ summary: 'Listar categorías financieras' })
  @ApiQuery({ name: 'type', description: 'Filtrar por tipo (INCOME, EXPENSE)', required: false })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  getCategories(@Query('type') type: string) {
    return this.financeService.findAllCategories(type);
  }

  @Post('categories')
  @RequirePermissions('MANAGE_FINANCE')
  @ApiOperation({ summary: 'Crear una categoría financiera' })
  @ApiBody({ type: CreateFinanceCategoryDto })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente' })
  createCategory(@Req() req: any, @Body() data: any) {
    return this.financeService.createCategory({ ...data, church: req.user.churchId || data.church });
  }

  @Get('transactions')
  @RequirePermissions('VIEW_FINANCE')
  @ApiOperation({ summary: 'Listar transacciones financieras' })
  @ApiQuery({ name: 'from', description: 'Fecha inicio (YYYY-MM-DD)', required: false })
  @ApiQuery({ name: 'to', description: 'Fecha fin (YYYY-MM-DD)', required: false })
  @ApiResponse({ status: 200, description: 'Lista de transacciones' })
  findAll(@Req() req: any, @Query() filters: any) {
    return this.financeService.findAllTransactions(req.user.churchId, filters);
  }

  @Post('transactions')
  @RequirePermissions('MANAGE_FINANCE')
  @ApiOperation({ summary: 'Crear una transacción financiera' })
  @ApiBody({ type: CreateFinanceTransactionDto })
  @ApiResponse({ status: 201, description: 'Transacción creada exitosamente' })
  create(@Req() req: any, @Body() data: any) {
    return this.financeService.createTransaction({
      ...data,
      createdBy: req.user.userId,
      church: req.user.churchId || data.church
    });
  }

  @Delete('transactions/:id')
  @RequirePermissions('MANAGE_FINANCE')
  @ApiOperation({ summary: 'Eliminar una transacción' })
  @ApiParam({ name: 'id', description: 'ID de la transacción' })
  @ApiResponse({ status: 200, description: 'Transacción eliminada' })
  remove(@Param('id') id: string) {
    return this.financeService.removeTransaction(id);
  }

  @Get('stats/balance')
  @RequirePermissions('VIEW_FINANCE')
  @ApiOperation({ summary: 'Obtener balance financiero' })
  @ApiQuery({ name: 'month', description: 'Mes', required: false })
  @ApiQuery({ name: 'year', description: 'Año', required: false })
  @ApiQuery({ name: 'church', description: 'ID de la iglesia', required: false })
  @ApiResponse({ status: 200, description: 'Balance financiero' })
  getBalance(@Req() req: any, @Query('month') month: number, @Query('year') year: number, @Query('church') churchId: string) {
    return this.financeService.getBalance(month, year, churchId || req.user.churchId);
  }

  @Get('stats/member-contributions/:memberId')
  @RequirePermissions('VIEW_FINANCE')
  @ApiOperation({ summary: 'Obtener contribuciones de un miembro' })
  @ApiParam({ name: 'memberId', description: 'ID del miembro' })
  @ApiResponse({ status: 200, description: 'Contribuciones del miembro' })
  getMemberContributions(@Param('memberId') memberId: string, @Req() req: any) {
    return this.financeService.getMemberContributions(memberId);
  }
}
