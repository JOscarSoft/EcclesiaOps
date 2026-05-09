import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('MANAGE_USERS')
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user.role === 'CHURCH_ADMIN' ? user.churchId : undefined);
  }

  @Post()
  @RequirePermissions('MANAGE_USERS')
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.usersService.create(data, user.churchId, user.role);
  }

  @Get('roles')
  getRoles() {
    return this.usersService.getRoles();
  }

  @Put(':id')
  @RequirePermissions('MANAGE_USERS')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.usersService.update(id, data, user.churchId, user.role);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_USERS')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(id, user.churchId, user.role);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  changePassword(@Body() body: { currentPassword: string; newPassword: string }, @CurrentUser() user: any) {
    return this.usersService.changePassword(user.userId, body.currentPassword, body.newPassword);
  }
}
