import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super_secret_jwt_key_change_me',
    });
  }

  async validate(payload: any) {
    // This payload is injected into Request.user
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.sub,
      email: payload.email,
      type: payload.type, // 'platform' | 'tenant'
      tenantId: payload.tenantId, // Present if type is 'tenant'
      churchId: payload.churchId, // Present if user belongs to a church
      role: payload.role,
      permissions: payload.permissions || [],
    };
  }
}
