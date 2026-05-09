import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiHeader } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('platform/auth/login')
  async platformLogin(@Body() loginDto: LoginDto) {
    return this.authService.platformLogin(loginDto.username, loginDto.password);
  }

  @Post('tenant/auth/login')
  @ApiHeader({ name: 'x-tenant-id', required: true, description: 'ID del Concilio' })
  async tenantLogin(@Body() loginDto: LoginDto, @Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new UnauthorizedException('x-tenant-id es requerido para el login de concilio');
    }
    return this.authService.tenantLogin(loginDto.username, loginDto.password, tenantId);
  }
}
