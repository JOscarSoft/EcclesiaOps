import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Role } from './schemas/role.schema';
import { Permission } from './schemas/permission.schema';

@Injectable()
export class RolesService {
  constructor(
    @Inject(`${Role.name}Model`) private roleModel: Model<Role>,
    @Inject(`${Permission.name}Model`) private permissionModel: Model<Permission>,
  ) {}

  async getPermissions() {
    return this.permissionModel.find().exec();
  }

  async findAll() {
    return this.roleModel.find().populate('permissions').exec();
  }

  async create(data: { name: string; permissions: string[] }) {
    const existing = await this.roleModel.findOne({ name: data.name });
    if (existing) throw new ConflictException('El rol ya existe');

    const newRole = new this.roleModel(data);
    return newRole.save();
  }

  async update(id: string, data: { name?: string; permissions?: string[] }) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException('Rol no encontrado');

    if (role.name === 'ADMIN' && data.name && data.name !== 'ADMIN') {
      throw new ConflictException('No se puede modificar el nombre del rol ADMIN');
    }
    
    // Si el nombre enviado es 'ADMIN' para el rol ADMIN, borrarlo del payload para que mongoose no chille si no cambia
    if (role.name === 'ADMIN') {
      delete data.name;
    }

    const updated = await this.roleModel.findByIdAndUpdate(id, data, { new: true }).populate('permissions').exec();
    if (!updated) throw new NotFoundException('Rol no encontrado');
    return updated;
  }

  async remove(id: string) {
    const role = await this.roleModel.findById(id);
    if (!role) throw new NotFoundException('Rol no encontrado');
    if (role.name === 'ADMIN') {
      throw new ConflictException('No se puede eliminar el rol ADMIN');
    }
    
    // We should check if users have this role, but we skip it for simplicity right now
    await this.roleModel.findByIdAndDelete(id).exec();
    return { success: true };
  }
}
