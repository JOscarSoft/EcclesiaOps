import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { createTenantModelProvider } from '../../tenants/tenant-models.provider';
import { User, UserSchema } from './schemas/user.schema';
import { Role, RoleSchema } from '../roles/schemas/role.schema';
import { Church, ChurchSchema } from '../churches/schemas/church.schema';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    createTenantModelProvider(User.name, UserSchema),
    createTenantModelProvider(Role.name, RoleSchema),
    createTenantModelProvider(Church.name, ChurchSchema),
  ],
})
export class UsersModule {}
