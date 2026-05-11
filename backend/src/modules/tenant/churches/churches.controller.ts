import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CreateChurchDto } from './dto/create-church.dto';
import { UpdateChurchDto } from './dto/update-church.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Churches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/churches')
export class ChurchesController {
  constructor(private readonly churchesService: ChurchesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las iglesias' })
  @ApiResponse({ status: 200, description: 'Lista de iglesias' })
  findAll() {
    return this.churchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una iglesia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la iglesia' })
  @ApiResponse({ status: 200, description: 'Datos de la iglesia' })
  @ApiResponse({ status: 404, description: 'Iglesia no encontrada' })
  findOne(@Param('id') id: string) {
    return this.churchesService.findOne(id);
  }

  @Post()
  @RequirePermissions('MANAGE_CHURCHES')
  @ApiOperation({ summary: 'Crear una nueva iglesia' })
  @ApiBody({ type: CreateChurchDto })
  @ApiResponse({ status: 201, description: 'Iglesia creada exitosamente' })
  create(@Body() data: any) {
    return this.churchesService.create(data);
  }

  @Put(':id')
  @RequirePermissions('MANAGE_CHURCHES')
  @ApiOperation({ summary: 'Actualizar una iglesia' })
  @ApiParam({ name: 'id', description: 'ID de la iglesia' })
  @ApiBody({ type: UpdateChurchDto })
  @ApiResponse({ status: 200, description: 'Iglesia actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Iglesia no encontrada' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.churchesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_CHURCHES')
  @ApiOperation({ summary: 'Eliminar (soft-delete) una iglesia' })
  @ApiParam({ name: 'id', description: 'ID de la iglesia' })
  @ApiResponse({ status: 200, description: 'Iglesia eliminada (marcada como inactiva)' })
  @ApiResponse({ status: 404, description: 'Iglesia no encontrada' })
  remove(@Param('id') id: string) {
    return this.churchesService.remove(id);
  }
}
