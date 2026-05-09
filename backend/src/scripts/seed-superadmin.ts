import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { PlatformUser } from '../modules/platform/users/schemas/platform-user.schema';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const platformUserModel = app.get<Model<PlatformUser>>(getModelToken(PlatformUser.name));

  const email = 'superadmin@ecclesiaops.com';
  
  const existing = await platformUserModel.findOne({ username: email });
  if (existing) {
    console.log('El SuperAdmin ya existe.');
    await app.close();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  await platformUserModel.create({
    username: email,
    email,
    passwordHash,
    name: 'Administrador Global',
  });

  console.log('SuperAdmin creado exitosamente.');
  console.log('Email: ', email);
  console.log('Password: admin123');

  await app.close();
}

bootstrap();
