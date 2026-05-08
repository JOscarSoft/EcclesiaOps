import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MinistriesController } from './ministries.controller';
import { MembersService } from './members.service';
import { MinistriesService } from './ministries.service';
import { createTenantModelProvider } from '../../tenants/tenant-models.provider';
import { Member, MemberSchema } from './schemas/member.schema';
import { Ministry, MinistrySchema } from './schemas/ministry.schema';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';

@Module({
  controllers: [MembersController, MinistriesController],
  providers: [
    MembersService,
    MinistriesService,
    createTenantModelProvider(Member.name, MemberSchema),
    createTenantModelProvider(Ministry.name, MinistrySchema),
    createTenantModelProvider(Attendance.name, AttendanceSchema),
  ],
  exports: [MembersService],
})
export class MembersModule {}
