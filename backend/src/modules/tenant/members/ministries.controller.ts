import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MinistriesService } from './ministries.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/ministries')
export class MinistriesController {
  constructor(private readonly ministriesService: MinistriesService) { }

  @Get()
  findAll() {
    return this.ministriesService.findAll();
  }

  @Post()
  @RequirePermissions('MANAGE_MINISTRIES')
  create(@Body() data: any) {
    return this.ministriesService.create(data);
  }

  @Put(':id')
  @RequirePermissions('MANAGE_MINISTRIES')
  update(@Param('id') id: string, @Body() data: any) {
    return this.ministriesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_MINISTRIES')
  remove(@Param('id') id: string) {
    return this.ministriesService.remove(id);
  }
}
