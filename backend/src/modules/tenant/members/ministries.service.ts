import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Ministry } from './schemas/ministry.schema';

@Injectable()
export class MinistriesService {
  constructor(
    @Inject(`${Ministry.name}Model`) private ministryModel: Model<Ministry>,
  ) {}

  async findAll() {
    return this.ministryModel.find({ isActive: true })
      .populate('leader', 'firstName lastName')
      .sort({ name: 1 })
      .exec();
  }

  async create(data: Partial<Ministry>) {
    const ministry = new this.ministryModel(data);
    return ministry.save();
  }

  async update(id: string, data: Partial<Ministry>) {
    const updated = await this.ministryModel.findByIdAndUpdate(id, data, { new: true })
      .populate('leader', 'firstName lastName')
      .exec();
    if (!updated) throw new NotFoundException('Ministerio no encontrado');
    return updated;
  }

  async remove(id: string) {
    const ministry = await this.ministryModel.findById(id);
    if (!ministry) throw new NotFoundException('Ministerio no encontrado');
    ministry.isActive = false;
    await ministry.save();
    return { success: true };
  }
}
