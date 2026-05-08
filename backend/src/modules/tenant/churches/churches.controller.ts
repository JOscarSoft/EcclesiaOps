import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/churches')
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Get()
  findAll() {
    return this.churchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.churchesService.findOne(id);
  }

  @Post()
  @RequirePermissions('MANAGE_CHURCHES')
  create(@Body() data: any) {
    return this.churchesService.create(data);
  }

  @Put(':id')
  @RequirePermissions('MANAGE_CHURCHES')
  update(@Param('id') id: string, @Body() data: any) {
    return this.churchesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_CHURCHES')
  remove(@Param('id') id: string) {
    return this.churchesService.remove(id);
  }


}
