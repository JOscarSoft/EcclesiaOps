import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('MANAGE_USERS')
  @ApiOperation({ summary: 'Listar usuarios del tenant' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user.role === 'CHURCH_ADMIN' ? user.churchId : undefined);
  }

  @Post()
  @RequirePermissions('MANAGE_USERS')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.usersService.create(data, user.churchId, user.role);
  }

  @Get('roles')
  @ApiOperation({ summary: 'Obtener roles disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de roles' })
  getRoles() {
    return this.usersService.getRoles();
  }

  @Put(':id')
  @RequirePermissions('MANAGE_USERS')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente' })
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.usersService.update(id, data, user.churchId, user.role);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_USERS')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user.churchId, user.role);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente' })
  changePassword(@Body() body: any, @CurrentUser() user: any) {
    return this.usersService.changePassword(user.userId, body.currentPassword, body.newPassword);
  }
}
