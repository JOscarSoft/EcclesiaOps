import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { createTenantModelProvider } from '../../tenants/tenant-models.provider';
import { Member, MemberSchema } from '../members/schemas/member.schema';
import { Finance, FinanceSchema } from '../finance/schemas/finance.schema';
import { Church, ChurchSchema } from '../churches/schemas/church.schema';

@Module({
  controllers: [StatsController],
  providers: [
    StatsService,
    createTenantModelProvider(Member.name, MemberSchema),
    createTenantModelProvider(Finance.name, FinanceSchema),
    createTenantModelProvider(Church.name, ChurchSchema),
  ],
})
export class StatsModule {}
