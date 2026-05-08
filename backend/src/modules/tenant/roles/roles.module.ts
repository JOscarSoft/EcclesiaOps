import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { createTenantModelProvider } from '../../tenants/tenant-models.provider';
import { Role, RoleSchema } from './schemas/role.schema';
import { Permission, PermissionSchema } from './schemas/permission.schema';

@Module({
  controllers: [RolesController],
  providers: [
    RolesService,
    createTenantModelProvider(Role.name, RoleSchema),
    createTenantModelProvider(Permission.name, PermissionSchema),
  ],
})
export class RolesModule {}
