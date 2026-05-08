import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @RequirePermissions('MANAGE_ROLES')
  getPermissions() {
    return this.rolesService.getPermissions();
  }

  @Get()
  @RequirePermissions('MANAGE_ROLES')
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @RequirePermissions('MANAGE_ROLES')
  create(@Body() data: { name: string; permissions: string[] }) {
    return this.rolesService.create(data);
  }

  @Put(':id')
  @RequirePermissions('MANAGE_ROLES')
  update(@Param('id') id: string, @Body() data: { name?: string; permissions?: string[] }) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_ROLES')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
