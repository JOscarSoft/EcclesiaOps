import { Module } from '@nestjs/common';
import { ChurchesController } from './churches.controller';
import { ChurchesService } from './churches.service';
import { createTenantModelProvider } from '../../tenants/tenant-models.provider';
import { Church, ChurchSchema } from './schemas/church.schema';

@Module({
  controllers: [ChurchesController],
  providers: [
    ChurchesService,
    createTenantModelProvider(Church.name, ChurchSchema),
  ],
})
export class ChurchesModule {}
