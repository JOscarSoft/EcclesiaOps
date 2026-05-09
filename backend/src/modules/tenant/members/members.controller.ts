import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { EventType } from './schemas/attendance.schema';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenant/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('stats')
  @RequirePermissions('VIEW_MEMBERS', 'MANAGE_MEMBERS')
  getStats(@CurrentUser() user: any) {
    return this.membersService.getStats(user.churchId);
  }

  @Get()
  @RequirePermissions('VIEW_MEMBERS', 'MANAGE_MEMBERS')
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
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Post()
  @RequirePermissions('MANAGE_MEMBERS')
  create(@Body() data: any) {
    return this.membersService.create(data);
  }

  @Put(':id')
  @RequirePermissions('MANAGE_MEMBERS')
  update(@Param('id') id: string, @Body() data: any) {
    return this.membersService.update(id, data);
  }

  @Delete(':id')
  @RequirePermissions('MANAGE_MEMBERS')
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }

  @Post(':id/attendance')
  @RequirePermissions('MANAGE_MEMBERS')
  recordAttendance(
    @Param('id') memberId: string,
    @Body() data: { date: string; eventType: EventType; present: boolean },
  ) {
    return this.membersService.recordAttendance({ memberId, ...data });
  }

  @Get(':id/attendance')
  @RequirePermissions('VIEW_MEMBERS', 'MANAGE_MEMBERS')
  getAttendance(@Param('id') memberId: string) {
    return this.membersService.getMemberAttendance(memberId);
  }
}
