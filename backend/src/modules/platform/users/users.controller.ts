import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { platformUsersService } from './users.service';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

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
  createPlatformUser(@Body() dto: { email: string, password: string, name: string }) {
    return this.usersService.createplatformUser(dto.email, dto.password, dto.name);
  }
}
