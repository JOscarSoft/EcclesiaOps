import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MinistriesService } from './ministries.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CreateMinistryDto } from './dto/create-ministry.dto';
import { UpdateMinistryDto } from './dto/update-ministry.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Ministries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/ministries')
export class MinistriesController {
  constructor(private readonly ministriesService: MinistriesService) { }

  @Get()
  @ApiOperation({ summary: 'Listar todos los ministerios' })
  @ApiResponse({ status: 200, description: 'Lista de ministerios' })
  findAll() {
    return this.ministriesService.findAll();
  }

  @Post()
  @RequirePermissions('MANAGE_MINISTRIES')
  @ApiOperation({ summary: 'Crear un nuevo ministerio' })
  @ApiBody({ type: CreateMinistryDto })
  @ApiResponse({ status: 201, description: 'Ministerio creado exitosamente' })
  create(@Body() data: any) {
    return this.ministriesService.create(data);
  }

  @Put(':id')
  @RequirePermissions('MANAGE_MINISTRIES')
  @ApiOperation({ summary: 'Actualizar un ministerio' })
  @ApiParam({ name: 'id', description: 'ID del ministerio' })
  @ApiBody({ type: UpdateMinistryDto })
  @ApiResponse({ status: 200, description: 'Ministerio actualizado exitosamente' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.ministriesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_MINISTRIES')
  @ApiOperation({ summary: 'Eliminar un ministerio' })
  @ApiParam({ name: 'id', description: 'ID del ministerio' })
  @ApiResponse({ status: 200, description: 'Ministerio eliminado' })
  remove(@Param('id') id: string) {
    return this.ministriesService.remove(id);
  }
}
