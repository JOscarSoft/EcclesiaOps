import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CouncilsService } from './councils.service';
import { CreateCouncilDto } from './dto/create-council.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Platform - Councils')
@ApiBearerAuth()
@Controller('platform/councils')
export class CouncilsController {
  constructor(private readonly councilsService: CouncilsService) {}

  @Get('by-domain/:domain')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener un concilio por dominio' })
  @ApiParam({ name: 'domain', description: 'Dominio del concilio' })
  findByDomain(@Param('domain') domain: string) {
    return this.councilsService.findByDomain(domain);
  }

  @Get('stats/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener estadísticas globales de la plataforma' })
  @ApiResponse({ status: 200, description: 'Estadísticas globales' })
  getStats() {
    return this.councilsService.getGlobalStats();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Listar todos los concilios (tenants)' })
  @ApiResponse({ status: 200, description: 'Lista de concilios' })
  findAll() {
    return this.councilsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Obtener un concilio por ID' })
  @ApiParam({ name: 'id', description: 'ID del concilio' })
  @ApiResponse({ status: 200, description: 'Datos del concilio' })
  @ApiResponse({ status: 404, description: 'Concilio no encontrado' })
  findOne(@Param('id') id: string) {
    return this.councilsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo concilio (tenant)' })
  @ApiResponse({ status: 201, description: 'Concilio creado exitosamente' })
  createCouncil(@Body() dto: CreateCouncilDto) {
    return this.councilsService.createCouncil(
      dto.name, dto.domain, dto.adminEmail, dto.adminPassword,
      dto.phone, dto.address, dto.contactName, dto.email,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Actualizar un concilio' })
  @ApiParam({ name: 'id', description: 'ID del concilio' })
  @ApiResponse({ status: 200, description: 'Concilio actualizado exitosamente' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.councilsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Eliminar un concilio' })
  @ApiParam({ name: 'id', description: 'ID del concilio' })
  @ApiResponse({ status: 200, description: 'Concilio eliminado' })
  remove(@Param('id') id: string) {
    return this.councilsService.remove(id);
  }
}
