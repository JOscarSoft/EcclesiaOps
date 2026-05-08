import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Member, MemberStatus } from './schemas/member.schema';
import { Attendance, EventType } from './schemas/attendance.schema';
import { Ministry } from './schemas/ministry.schema';

@Injectable()
export class MembersService {
  constructor(
    @Inject(`${Member.name}Model`) private memberModel: Model<Member>,
    @Inject(`${Attendance.name}Model`) private attendanceModel: Model<Attendance>,
    @Inject(`${Ministry.name}Model`) private ministryModel: Model<Ministry>,
  ) {}

  async findAll(filters?: {
    status?: string;
    gender?: string;
    ministry?: string;
    church?: string;
    search?: string;
  }) {
    const query: any = { isActive: true };

    if (filters?.status) query.status = filters.status;
    if (filters?.gender) query.gender = filters.gender;
    if (filters?.church) query.church = filters.church;
    if (filters?.ministry) query.ministries = filters.ministry;
    if (filters?.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const members = await this.memberModel
      .find(query)
      .populate('church', 'name', 'Church')
      .populate('ministries', 'name', 'Ministry')
      .sort({ firstName: 1, lastName: 1 })
      .exec();

    return members.map((m) => m.toJSON());
  }

  async findOne(id: string) {
    const member = await this.memberModel
      .findById(id)
      .populate('church', 'name', 'Church')
      .populate('ministries', 'name description', 'Ministry')
      .exec();
    if (!member || !member.isActive) throw new NotFoundException('Miembro no encontrado');
    return member.toJSON();
  }

  async create(data: Partial<Member>) {
    const member = new this.memberModel(data);
    return (await member.save()).toJSON();
  }

  async update(id: string, data: Partial<Member>) {
    const updated = await this.memberModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate('church', 'name', 'Church')
      .populate('ministries', 'name', 'Ministry')
      .exec();
    if (!updated) throw new NotFoundException('Miembro no encontrado');
    return updated.toJSON();
  }

  async remove(id: string) {
    const member = await this.memberModel.findById(id);
    if (!member) throw new NotFoundException('Miembro no encontrado');
    member.isActive = false;
    await member.save();
    return { success: true };
  }

  // --- Attendance ---

  async recordAttendance(data: { memberId: string; date: string; eventType: EventType; present: boolean }) {
    const existing = await this.attendanceModel.findOne({
      member: data.memberId,
      date: new Date(data.date),
      eventType: data.eventType,
    });
    if (existing) {
      existing.present = data.present;
      return existing.save();
    }
    const record = new this.attendanceModel({
      member: data.memberId,
      date: new Date(data.date),
      eventType: data.eventType,
      present: data.present,
    });
    return record.save();
  }

  async getMemberAttendance(memberId: string, limit = 12) {
    return this.attendanceModel
      .find({ member: memberId })
      .sort({ date: -1 })
      .limit(limit)
      .exec();
  }

  // --- Stats / Reports ---

  async getStats(churchId?: string) {
    const baseQuery: any = { isActive: true };
    if (churchId) baseQuery.church = churchId;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      total,
      active,
      inactive,
      visitors,
      newThisMonth,
      baptized,
      byGender,
      byMinistry,
    ] = await Promise.all([
      this.memberModel.countDocuments({ ...baseQuery }),
      this.memberModel.countDocuments({ ...baseQuery, status: MemberStatus.ACTIVE }),
      this.memberModel.countDocuments({ ...baseQuery, status: MemberStatus.INACTIVE }),
      this.memberModel.countDocuments({ ...baseQuery, status: MemberStatus.VISITOR }),
      this.memberModel.countDocuments({ ...baseQuery, joinDate: { $gte: thirtyDaysAgo } }),
      this.memberModel.countDocuments({ ...baseQuery, baptized: true }),
      this.memberModel.aggregate([
        { $match: { ...baseQuery } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
      this.memberModel.aggregate([
        { $match: { ...baseQuery } },
        { $unwind: '$ministries' },
        {
          $lookup: {
            from: 'ministries',
            localField: 'ministries',
            foreignField: '_id',
            as: 'ministryData',
          },
        },
        { $unwind: '$ministryData' },
        { $group: { _id: '$ministryData.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    return { total, active, inactive, visitors, newThisMonth, baptized, byGender, byMinistry };
  }
}
