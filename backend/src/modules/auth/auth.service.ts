import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { PlatformUser } from '../platform/users/schemas/platform-user.schema';
import { User, UserSchema } from '../tenant/users/schemas/user.schema';
import { Role, RoleSchema } from '../tenant/roles/schemas/role.schema';
import { Permission, PermissionSchema } from '../tenant/roles/schemas/permission.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(PlatformUser.name) private platformUserModel: Model<PlatformUser>,
    private jwtService: JwtService,
  ) { }

  async platformLogin(email: string, passwordRaw: string) {
    const user = await this.platformUserModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Credenciales inválidas!!!');

    const isValid = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { email: user.email, sub: user._id, type: 'platform', role: 'SUPER_ADMIN' };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }), // Simplified for MVP
    };
  }

  async tenantLogin(email: string, passwordRaw: string, tenantId: string) {
    // Dynamic connection to verify user
    const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/platform_db';
    const uriParts = baseUri.split('/');
    const lastPart = uriParts.pop();
    const queryParams = lastPart?.includes('?') ? '?' + lastPart.split('?')[1] : '';
    const tenantUri = [...uriParts, `tenant_${tenantId}${queryParams}`].join('/');

    const connection = mongoose.createConnection(tenantUri);
    const UserModel = connection.model<User>(User.name, UserSchema);
    const RoleModel = connection.model<Role>(Role.name, RoleSchema);
    const PermissionModel = connection.model<Permission>(Permission.name, PermissionSchema);

    const user = await UserModel.findOne({ email }).populate({
      path: 'role',
      model: RoleModel,
      populate: {
        path: 'permissions',
        model: PermissionModel
      }
    });

    if (!user || !user.isActive) {
      await connection.close();
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    const isValid = await bcrypt.compare(passwordRaw, user.passwordHash);
    if (!isValid) {
      await connection.close();
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const roleObj = user.role as any;
    const roleName = roleObj?.name || 'USER';
    const permissions = roleObj?.permissions?.map((p: any) => p.name) || [];

    const payload = {
      email: user.email,
      sub: user._id,
      type: 'tenant',
      tenantId,
      churchId: (user as any).church,
      role: roleName,
      permissions
    };

    const tokens = {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };

    await connection.close();
    return tokens;
  }
}
