import { Injectable } from '@nestjs/common';
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

  async createplatformUser(adminEmail: string, adminPasswordRaw: string, name: string) {
    const existing = await this.platformUserModel.findOne({ adminEmail });
    if (existing) {
      console.log('El usuario ya existe.');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPasswordRaw, salt);

    const newUser = await this.platformUserModel.create({
      email: adminEmail,
      passwordHash: passwordHash,
      name: name,
    });

    return newUser;
  }

}
