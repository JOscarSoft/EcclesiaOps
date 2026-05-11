import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('types')
  @RequirePermissions('VIEW_ACTIVITIES')
  @ApiOperation({ summary: 'Listar tipos de actividad' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de actividad' })
  findAllTypes() {
    return this.activitiesService.findAllTypes();
  }

  @Post('types')
  @RequirePermissions('MANAGE_ACTIVITIES')
  @ApiOperation({ summary: 'Crear un tipo de actividad' })
  @ApiBody({ type: CreateActivityTypeDto })
  @ApiResponse({ status: 201, description: 'Tipo de actividad creado exitosamente' })
  createType(@Body() data: any) {
    return this.activitiesService.createType(data);
  }

  @Get()
  @RequirePermissions('VIEW_ACTIVITIES')
  @ApiOperation({ summary: 'Listar actividades' })
  @ApiQuery({ name: 'onlyCouncil', description: 'Filtrar solo actividades conciliares', required: false })
  @ApiQuery({ name: 'from', description: 'Fecha inicio (YYYY-MM-DD)', required: false })
  @ApiQuery({ name: 'to', description: 'Fecha fin (YYYY-MM-DD)', required: false })
  @ApiResponse({ status: 200, description: 'Lista de actividades' })
  findAll(
    @Req() req: any, 
    @Query('onlyCouncil') onlyCouncil: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.activitiesService.findAll({
      churchId: req.user.churchId,
      onlyCouncil: onlyCouncil === 'true',
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Post()
  @RequirePermissions('MANAGE_ACTIVITIES')
  @ApiOperation({ summary: 'Crear una nueva actividad' })
  @ApiBody({ type: CreateActivityDto })
  @ApiResponse({ status: 201, description: 'Actividad creada exitosamente' })
  create(@Req() req: any, @Body() data: any) {
    if (!data.church && req.user.churchId) {
      throw new ForbiddenException('Los usuarios de iglesia no pueden crear actividades conciliares.');
    }

    return this.activitiesService.create({
      ...data,
      church: data.church || null,
      organizer: req.user.userId,
    });
  }

  @Put(':id')
  @RequirePermissions('MANAGE_ACTIVITIES')
  @ApiOperation({ summary: 'Actualizar una actividad' })
  @ApiParam({ name: 'id', description: 'ID de la actividad' })
  @ApiResponse({ status: 200, description: 'Actividad actualizada exitosamente' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.activitiesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_ACTIVITIES')
  @ApiOperation({ summary: 'Eliminar una actividad' })
  @ApiParam({ name: 'id', description: 'ID de la actividad' })
  @ApiResponse({ status: 200, description: 'Actividad eliminada' })
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
