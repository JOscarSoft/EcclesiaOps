import { Controller, Get, UseGuards, Query, Req } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('summary')
  @RequirePermissions('VIEW_DASHBOARD')
  getSummary(@Req() req: any, @Query('church') churchId?: string) {
    return this.statsService.getExecutiveSummary(churchId || req.user.churchId);
  }

  @Get('finance-trends')
  @RequirePermissions('VIEW_FINANCE')
  getFinanceTrends(@Req() req: any, @Query('church') churchId?: string) {
    return this.statsService.getFinanceTrends(churchId || req.user.churchId);
  }

  @Get('member-demographics')
  @RequirePermissions('VIEW_DASHBOARD')
  getMemberDemographics(@Req() req: any, @Query('church') churchId?: string) {
    return this.statsService.getMemberDemographics(churchId || req.user.churchId);
  }

  @Get('finance-categories')
  @RequirePermissions('VIEW_DASHBOARD')
  getFinanceByCategories(@Req() req: any, @Query('church') churchId?: string) {
    return this.statsService.getFinanceByCategories(churchId || req.user.churchId);
  }

  @Get('finance-churches')
  @RequirePermissions('VIEW_DASHBOARD')
  getFinanceByChurches() {
    return this.statsService.getFinanceByChurch();
  }
}
