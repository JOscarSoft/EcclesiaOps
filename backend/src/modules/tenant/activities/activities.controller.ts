import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('types')
  @RequirePermissions('VIEW_ACTIVITIES')
  findAllTypes() {
    return this.activitiesService.findAllTypes();
  }

  @Post('types')
  @RequirePermissions('MANAGE_ACTIVITIES')
  createType(@Body() data: any) {
    return this.activitiesService.createType(data);
  }

  @Get()
  @RequirePermissions('VIEW_ACTIVITIES')
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
  create(@Req() req: any, @Body() data: any) {
    // Si se intenta crear una actividad conciliar (church null) 
    // pero el usuario pertenece a una iglesia, denegar.
    if (!data.church && req.user.churchId) {
      throw new ForbiddenException('Los usuarios de iglesia no pueden crear actividades conciliares.');
    }

    return this.activitiesService.create({
      ...data,
      church: data.church || null, // null = Conciliar
      organizer: req.user.userId,
    });
  }

  @Put(':id')
  @RequirePermissions('MANAGE_ACTIVITIES')
  update(@Param('id') id: string, @Body() data: any) {
    return this.activitiesService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_ACTIVITIES')
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}
