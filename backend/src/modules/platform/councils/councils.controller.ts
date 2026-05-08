import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CouncilsService } from './councils.service';
import { CreateCouncilDto } from './dto/create-council.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Platform - Councils')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
@Controller('platform/councils')
export class CouncilsController {
  constructor(private readonly councilsService: CouncilsService) {}
  
  @Get('stats/summary')
  getStats() {
    return this.councilsService.getGlobalStats();
  }

  @Get()
  findAll() {
    return this.councilsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.councilsService.findOne(id);
  }

  @Post()
  createCouncil(@Body() dto: CreateCouncilDto) {
    return this.councilsService.createCouncil(dto.name, dto.domain, dto.adminEmail, dto.adminPassword);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.councilsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.councilsService.remove(id);
  }
}
