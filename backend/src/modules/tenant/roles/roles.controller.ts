import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @RequirePermissions('MANAGE_ROLES')
  @ApiOperation({ summary: 'Obtener lista de todos los permisos disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de permisos' })
  getPermissions() {
    return this.rolesService.getPermissions();
  }

  @Get()
  @RequirePermissions('MANAGE_ROLES')
  @ApiOperation({ summary: 'Listar roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @RequirePermissions('MANAGE_ROLES')
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Rol creado exitosamente' })
  create(@Body() data: any) {
    return this.rolesService.create(data);
  }

  @Put(':id')
  @RequirePermissions('MANAGE_ROLES')
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Rol actualizado exitosamente' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_ROLES')
  @ApiOperation({ summary: 'Eliminar un rol' })
  @ApiParam({ name: 'id', description: 'ID del rol' })
  @ApiResponse({ status: 200, description: 'Rol eliminado' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
