import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { TENANT_CONNECTION } from '../../tenants/tenant-connection.provider';
import { Connection } from 'mongoose';
import { 
  Finance, FinanceSchema, 
  Tithe, TitheSchema, 
  Offering, OfferingSchema, 
  Expense, ExpenseSchema, 
  FinanceCategory, FinanceCategorySchema 
} from './schemas/finance.schema';
import { Member, MemberSchema } from '../members/schemas/member.schema';
import { Church, ChurchSchema } from '../churches/schemas/church.schema';

@Module({
  providers: [
    FinanceService,
    {
      provide: 'CHURCH_MODEL',
      useFactory: (connection: Connection) => connection.model(Church.name, ChurchSchema),
      inject: [TENANT_CONNECTION],
    },
    {
      provide: 'FINANCE_MODEL',
      useFactory: (connection: Connection) => {
        // Setup discriminators
        const model = connection.model(Finance.name, FinanceSchema);
        if (!model.discriminators || !model.discriminators['Tithe']) {
          model.discriminator('Tithe', TitheSchema);
          model.discriminator('Offering', OfferingSchema);
          model.discriminator('Expense', ExpenseSchema);
        }
        return model;
      },
      inject: [TENANT_CONNECTION],
    },
    {
      provide: 'FINANCE_CATEGORY_MODEL',
      useFactory: (connection: Connection) => connection.model(FinanceCategory.name, FinanceCategorySchema),
      inject: [TENANT_CONNECTION],
    },
    {
      provide: 'MEMBER_MODEL',
      useFactory: (connection: Connection) => connection.model(Member.name, MemberSchema),
      inject: [TENANT_CONNECTION],
    },
  ],
  controllers: [FinanceController],
  exports: [FinanceService],
})
export class FinanceModule {}
