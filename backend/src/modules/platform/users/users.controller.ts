import { Controller, Get, Post, Body, Param, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { platformUsersService } from './users.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Platform - Users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('platform/users')
export class PlatformUsersController {
  constructor(private readonly usersService: platformUsersService) { }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  createPlatformUser(@Body() dto: { username: string, email?: string, password: string, name: string }) {
    return this.usersService.createplatformUser(dto.username, dto.password, dto.name, dto.email);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  changePassword(@Body() body: { currentPassword: string; newPassword: string }, @CurrentUser() user: any) {
    return this.usersService.changePassword(user.userId, body.currentPassword, body.newPassword);
  }
}
