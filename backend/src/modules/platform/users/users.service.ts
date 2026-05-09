import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformUser } from './schemas/platform-user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class platformUsersService {
  constructor(
    @InjectModel(PlatformUser.name) private platformUserModel: Model<PlatformUser>,
  ) { }

  async findAll() {
    return this.platformUserModel.find({ isActive: true }).exec();
  }

  async createplatformUser(username: string, adminPasswordRaw: string, name: string, email?: string) {
    const existing = await this.platformUserModel.findOne({ username });
    if (existing) {
      console.log('El usuario ya existe.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPasswordRaw, salt);

    const newUser = await this.platformUserModel.create({
      username,
      email,
      passwordHash: passwordHash,
      name: name,
    });

    return newUser;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.platformUserModel.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('La contraseña actual no es correcta');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.platformUserModel.findByIdAndUpdate(userId, { passwordHash });
    return { message: 'Contraseña actualizada exitosamente' };
  }
}
