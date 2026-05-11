import { Controller, Get, Post, Body, Param, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { platformUsersService } from './users.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Platform - Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('platform/users')
export class PlatformUsersController {
  constructor(private readonly usersService: platformUsersService) { }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios de plataforma' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear un usuario de plataforma' })
  @ApiBody({ type: CreatePlatformUserDto })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  createPlatformUser(@Body() dto: any) {
    return this.usersService.createplatformUser(dto.username, dto.password, dto.name, dto.email);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Cambiar contraseña del usuario de plataforma autenticado' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente' })
  changePassword(@Body() body: any, @CurrentUser() user: any) {
    return this.usersService.changePassword(user.userId, body.currentPassword, body.newPassword);
  }
}
