import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CreateMemberDto } from './dto/create-member.dto';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { EventType } from './schemas/attendance.schema';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('stats')
  @RequirePermissions('VIEW_MEMBERS', 'MANAGE_MEMBERS')
  @ApiOperation({ summary: 'Obtener estadísticas de miembros' })
  @ApiQuery({ name: 'church', description: 'Filtrar por iglesia', required: false })
  @ApiResponse({ status: 200, description: 'Estadísticas de miembros' })
  getStats(@CurrentUser() user: any) {
    return this.membersService.getStats(user.churchId);
  }

  @Get()
  @RequirePermissions('VIEW_MEMBERS', 'MANAGE_MEMBERS')
  @ApiOperation({ summary: 'Listar miembros' })
  @ApiQuery({ name: 'status', description: 'Filtrar por estado (ACTIVE, INACTIVE, VISITOR)', required: false })
  @ApiQuery({ name: 'gender', description: 'Filtrar por género (MALE, FEMALE)', required: false })
  @ApiQuery({ name: 'ministry', description: 'Filtrar por ID de ministerio', required: false })
  @ApiQuery({ name: 'church', description: 'Filtrar por ID de iglesia', required: false })
  @ApiQuery({ name: 'search', description: 'Buscar por nombre, email o teléfono', required: false })
  @ApiResponse({ status: 200, description: 'Lista de miembros' })
  findAll(
    @Query('status') status?: string,
    @Query('gender') gender?: string,
    @Query('ministry') ministry?: string,
    @Query('church') church?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: any,
  ) {
    return this.membersService.findAll({
      status,
      gender,
      ministry,
      church: church || user?.churchId,
      search,
    });
  }

  @Get(':id')
  @RequirePermissions('VIEW_MEMBERS', 'MANAGE_MEMBERS')
  @ApiOperation({ summary: 'Obtener un miembro por ID' })
  @ApiParam({ name: 'id', description: 'ID del miembro' })
  @ApiResponse({ status: 200, description: 'Datos del miembro' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Post()
  @RequirePermissions('MANAGE_MEMBERS')
  @ApiOperation({ summary: 'Crear un nuevo miembro' })
  @ApiBody({ type: CreateMemberDto })
  @ApiResponse({ status: 201, description: 'Miembro creado exitosamente' })
  create(@Body() data: any) {
    return this.membersService.create(data);
  }

  @Put(':id')
  @RequirePermissions('MANAGE_MEMBERS')
  @ApiOperation({ summary: 'Actualizar un miembro' })
  @ApiParam({ name: 'id', description: 'ID del miembro' })
  @ApiResponse({ status: 200, description: 'Miembro actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.membersService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_MEMBERS')
  @ApiOperation({ summary: 'Eliminar (soft-delete) un miembro' })
  @ApiParam({ name: 'id', description: 'ID del miembro' })
  @ApiResponse({ status: 200, description: 'Miembro eliminado (marcado como inactivo)' })
  @ApiResponse({ status: 404, description: 'Miembro no encontrado' })
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }

  @Post(':id/attendance')
  @RequirePermissions('MANAGE_MEMBERS')
  @ApiOperation({ summary: 'Registrar asistencia de un miembro' })
  @ApiParam({ name: 'id', description: 'ID del miembro' })
  @ApiBody({ type: RecordAttendanceDto })
  @ApiResponse({ status: 201, description: 'Asistencia registrada' })
  recordAttendance(
    @Param('id') memberId: string,
    @Body() data: any,
  ) {
    return this.membersService.recordAttendance({ memberId, ...data });
  }

  @Get(':id/attendance')
  @RequirePermissions('VIEW_MEMBERS', 'MANAGE_MEMBERS')
  @ApiOperation({ summary: 'Obtener historial de asistencia de un miembro' })
  @ApiParam({ name: 'id', description: 'ID del miembro' })
  @ApiResponse({ status: 200, description: 'Historial de asistencia' })
  getAttendance(@Param('id') memberId: string) {
    return this.membersService.getMemberAttendance(memberId);
  }
}
