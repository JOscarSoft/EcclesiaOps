import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { createTenantModelProvider } from '../../tenants/tenant-models.provider';
import { Activity, ActivitySchema } from './schemas/activity.schema';
import { ActivityType, ActivityTypeSchema } from './schemas/activity-type.schema';
import { Church, ChurchSchema } from '../churches/schemas/church.schema';

@Module({
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService,
    createTenantModelProvider(Activity.name, ActivitySchema),
    createTenantModelProvider(ActivityType.name, ActivityTypeSchema),
    createTenantModelProvider(Church.name, ChurchSchema),
  ],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
