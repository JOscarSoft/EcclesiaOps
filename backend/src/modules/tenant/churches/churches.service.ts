import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Church } from './schemas/church.schema';

@Injectable()
export class ChurchesService {
  constructor(
    @Inject(`${Church.name}Model`) private churchModel: Model<Church>,
  ) {}

  async findAll() {
    return this.churchModel.find().exec();
  }

  async findOne(id: string) {
    const church = await this.churchModel.findById(id).exec();
    if (!church) throw new NotFoundException('Iglesia no encontrada');
    return church;
  }

  async create(data: any) {
    const createdChurch = new this.churchModel(data);
    return createdChurch.save();
  }

  async update(id: string, data: any) {
    const updatedChurch = await this.churchModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!updatedChurch) throw new NotFoundException('Iglesia no encontrada');
    return updatedChurch;
  }

  async remove(id: string) {
    const deleted = await this.churchModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    if (!deleted) throw new NotFoundException('Iglesia no encontrada');
    return deleted;
  }
}
