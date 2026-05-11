import { Controller, Get, UseGuards, Query, Req } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  @RequirePermissions('VIEW_DASHBOARD')
  @ApiOperation({ summary: 'Obtener resumen ejecutivo del dashboard' })
  @ApiQuery({ name: 'church', description: 'Filtrar por iglesia', required: false })
  @ApiResponse({ status: 200, description: 'Resumen ejecutivo' })
  getSummary(@Req() req: any, @Query('church') churchId?: string) {
    return this.statsService.getExecutiveSummary(churchId || req.user.churchId);
  }

  @Get('finance-trends')
  @RequirePermissions('VIEW_FINANCE')
  @ApiOperation({ summary: 'Obtener tendencias financieras' })
  @ApiQuery({ name: 'church', description: 'Filtrar por iglesia', required: false })
  @ApiResponse({ status: 200, description: 'Tendencias financieras' })
  getFinanceTrends(@Req() req: any, @Query('church') churchId?: string) {
    return this.statsService.getFinanceTrends(churchId || req.user.churchId);
  }

  @Get('member-demographics')
  @RequirePermissions('VIEW_DASHBOARD')
  @ApiOperation({ summary: 'Obtener demografía de miembros' })
  @ApiQuery({ name: 'church', description: 'Filtrar por iglesia', required: false })
  @ApiResponse({ status: 200, description: 'Datos demográficos' })
  getMemberDemographics(@Req() req: any, @Query('church') churchId?: string) {
    return this.statsService.getMemberDemographics(churchId || req.user.churchId);
  }

  @Get('finance-categories')
  @RequirePermissions('VIEW_DASHBOARD')
  @ApiOperation({ summary: 'Obtener finanzas por categoría' })
  @ApiQuery({ name: 'church', description: 'Filtrar por iglesia', required: false })
  @ApiResponse({ status: 200, description: 'Finanzas por categoría' })
  getFinanceByCategories(@Req() req: any, @Query('church') churchId?: string) {
    return this.statsService.getFinanceByCategories(churchId || req.user.churchId);
  }

  @Get('finance-churches')
  @RequirePermissions('VIEW_DASHBOARD')
  @ApiOperation({ summary: 'Obtener finanzas por iglesia' })
  @ApiResponse({ status: 200, description: 'Finanzas por iglesia' })
  getFinanceByChurches() {
    return this.statsService.getFinanceByChurch();
  }
}
