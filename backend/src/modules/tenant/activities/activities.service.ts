import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Activity } from './schemas/activity.schema';
import { ActivityType } from './schemas/activity-type.schema';

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(`${Activity.name}Model`) private activityModel: Model<Activity>,
    @Inject(`${ActivityType.name}Model`) private typeModel: Model<ActivityType>,
    @Inject('ChurchModel') private churchModel: Model<any>, // Force registration for populate
  ) {}

  // --- ACTIVITY TYPES ---
  async findAllTypes() {
    return this.typeModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async createType(data: Partial<ActivityType>) {
    return this.typeModel.create(data);
  }

  // --- ACTIVITIES ---
  async findAll(filters: { 
    churchId?: string, 
    onlyCouncil?: boolean,
    from?: Date,
    to?: Date 
  } = {}) {
    const query: any = { isActive: true };
    
    // Filtro de Jerarquía
    if (filters.onlyCouncil) {
      query.church = null;
    } else if (filters.churchId) {
      query.$or = [{ church: filters.churchId }, { church: null }];
    }

    // Filtro Temporal
    if (filters.from || filters.to) {
      query.startDate = {};
      if (filters.from) query.startDate.$gte = filters.from;
      if (filters.to) query.startDate.$lte = filters.to;
    } else {
      // Por defecto: Solo actividades futuras
      query.startDate = { $gte: new Date() };
    }

    return this.activityModel.find(query)
      .populate('activityType')
      .populate('church', 'name')
      .sort({ startDate: 1 })
      .exec();
  }

  async create(data: Partial<Activity>) {
    const activity = new this.activityModel(data);
    return activity.save();
  }

  async update(id: string, data: Partial<Activity>) {
    const updated = await this.activityModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updated) throw new NotFoundException('Actividad no encontrada');
    return updated;
  }

  async remove(id: string) {
    const activity = await this.activityModel.findById(id);
    if (!activity) throw new NotFoundException('Actividad no encontrada');
    activity.isActive = false;
    await activity.save();
    return { success: true };
  }
}
