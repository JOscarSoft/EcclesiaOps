import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformUser, PlatformUserSchema } from './schemas/platform-user.schema';
import { platformUsersService } from './users.service';
import { PlatformUsersController } from './users.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: PlatformUser.name, schema: PlatformUserSchema }])],
  controllers: [PlatformUsersController],
  providers: [platformUsersService],
})
export class PlatformUsersModule { }
