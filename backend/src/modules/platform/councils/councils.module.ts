import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Council, CouncilSchema } from './schemas/council.schema';
import { CouncilsService } from './councils.service';
import { CouncilsController } from './councils.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Council.name, schema: CouncilSchema }])],
  controllers: [CouncilsController],
  providers: [CouncilsService],
})
export class CouncilsModule {}
