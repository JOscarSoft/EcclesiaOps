import { Injectable, Inject, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Role } from '../roles/schemas/role.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject(`${User.name}Model`) private userModel: Model<User>,
    @Inject(`${Role.name}Model`) private roleModel: Model<Role>,
  ) {}

  async findAll(churchId?: string) {
    const filter = churchId ? { church: churchId } : {};
    return this.userModel.find(filter).populate('role', 'name').populate('church', 'name').exec();
  }

  async create(data: any, currentUserChurchId?: string, currentUserRole?: string) {
    if (currentUserRole !== 'ADMIN') {
      if (data.church && data.church !== currentUserChurchId?.toString()) {
        throw new ConflictException('No puedes crear un usuario para otra iglesia');
      }
    }

    const existingUsername = await this.userModel.findOne({ username: data.username });
    if (existingUsername) throw new ConflictException('El nombre de usuario ya está registrado');

    if (data.email) {
      const existingEmail = await this.userModel.findOne({ email: data.email });
      if (existingEmail) throw new ConflictException('El correo ya está registrado');
    }

    const role = await this.roleModel.findById(data.role);
    if (!role) throw new NotFoundException('Rol no encontrado');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newUser = new this.userModel({
      ...data,
      passwordHash,
    });
    return newUser.save();
  }

  async update(id: string, updateData: any, currentUserChurchId?: string, currentUserRole?: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (currentUserRole !== 'ADMIN') {
      if (user.church?.toString() !== currentUserChurchId?.toString()) {
        throw new ConflictException('No puedes editar un usuario de otra iglesia');
      }
      if (updateData.church && updateData.church !== currentUserChurchId?.toString()) {
        throw new ConflictException('No puedes mover un usuario a otra iglesia');
      }
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
    }
    delete updateData.password;

    const updated = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    return updated;
  }

  async remove(id: string, currentUserChurchId?: string, currentUserRole?: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (currentUserRole !== 'ADMIN') {
      if (user.church?.toString() !== currentUserChurchId?.toString()) {
        throw new ConflictException('No puedes eliminar un usuario de otra iglesia');
      }
    }

    const deleted = await this.userModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    return deleted;
  }

  async getRoles() {
    return this.roleModel.find().exec();
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('La contraseña actual no es correcta');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await this.userModel.findByIdAndUpdate(userId, { passwordHash });
    return { message: 'Contraseña actualizada exitosamente' };
  }
}
