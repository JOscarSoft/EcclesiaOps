import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as mongoose from 'mongoose';
import { Council } from './schemas/council.schema';
import { User, UserSchema } from '../../tenant/users/schemas/user.schema';
import { Role, RoleSchema } from '../../tenant/roles/schemas/role.schema';
import { Permission, PermissionSchema } from '../../tenant/roles/schemas/permission.schema';
import { Church, ChurchSchema } from '../../tenant/churches/schemas/church.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CouncilsService {
  constructor(
    @InjectModel(Council.name) private councilModel: Model<Council>,
  ) {}

  async findAll() {
    return this.councilModel.find({ isActive: true }).exec();
  }

  async findOne(id: string) {
    const council = await this.councilModel.findById(id).exec();
    if (!council) throw new NotFoundException('Concilio no encontrado');
    return council;
  }

  async getGlobalStats() {
    const councils = await this.councilModel.find({ isActive: true }).exec();
    const totalCouncils = councils.length;
    let totalChurches = 0;

    const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/platform_db';
    const uriParts = baseUri.split('/');
    uriParts.pop();
    const baseConnUri = uriParts.join('/');

    for (const council of councils) {
      try {
        const tenantUri = `${baseConnUri}/tenant_${council.domain}`;
        const connection = mongoose.createConnection(tenantUri);
        const TenantChurchModel = connection.model<Church>(Church.name, ChurchSchema);
        const count = await TenantChurchModel.countDocuments({ isActive: true });
        totalChurches += count;
        await connection.close();
      } catch (err) {
        console.error(`Error counting churches for council ${council.domain}:`, err);
      }
    }

    return {
      totalCouncils,
      totalChurches
    };
  }

  async createCouncil(name: string, domain: string, adminEmail: string, adminPasswordRaw: string) {
    const existing = await this.councilModel.findOne({ domain });
    if (existing) {
      throw new ConflictException('El dominio del concilio ya existe');
    }

    const newCouncil = await this.councilModel.create({ name, domain });

    await this.provisionTenantDb(domain, adminEmail, adminPasswordRaw);

    return newCouncil;
  }

  async update(id: string, updateData: any) {
    const updated = await this.councilModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updated) throw new NotFoundException('Concilio no encontrado');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.councilModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
    if (!deleted) throw new NotFoundException('Concilio no encontrado');
    return deleted;
  }

  private async provisionTenantDb(tenantId: string, adminEmail: string, adminPasswordRaw: string) {
    const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/platform_db';
    const uriParts = baseUri.split('/');
    const lastPart = uriParts.pop(); 
    const queryParams = lastPart?.includes('?') ? '?' + lastPart.split('?')[1] : '';
    const newDbName = `tenant_${tenantId}${queryParams}`;
    const tenantUri = [...uriParts, newDbName].join('/');

    const connection = mongoose.createConnection(tenantUri);
    
    const UserModel = connection.model<User>(User.name, UserSchema);
    const RoleModel = connection.model<Role>(Role.name, RoleSchema);
    const PermissionModel = connection.model<Permission>(Permission.name, PermissionSchema);

    const standardPermissions = [
      { name: 'VIEW_DASHBOARD', description: 'Ver Dashboard' },
      { name: 'MANAGE_USERS', description: 'Administrar Usuarios' },
      { name: 'MANAGE_CHURCHES', description: 'Administrar Iglesias' },
      { name: 'MANAGE_ROLES', description: 'Administrar Roles y Permisos' },
      { name: 'VIEW_FINANCE', description: 'Ver Finanzas' },
      { name: 'MANAGE_FINANCE', description: 'Administrar Finanzas' },
      { name: 'VIEW_MEMBERS', description: 'Ver Miembros' },
      { name: 'MANAGE_MEMBERS', description: 'Administrar Miembros' },
      { name: 'VIEW_MINISTRIES', description: 'Ver Ministerios' },
      { name: 'MANAGE_MINISTRIES', description: 'Administrar Ministerios' },
      { name: 'VIEW_ACTIVITIES', description: 'Ver Actividades' },
      { name: 'MANAGE_ACTIVITIES', description: 'Administrar Actividades' },
    ];
    
    const createdPermissions = await PermissionModel.insertMany(standardPermissions);
    const permissionIds = createdPermissions.map(p => p._id);

    const adminRole = await RoleModel.create({ name: 'ADMIN', permissions: permissionIds });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPasswordRaw, salt);

    await UserModel.create({
      username: adminEmail,
      email: adminEmail,
      passwordHash,
      firstName: 'Admin',
      lastName: 'Concilio',
      role: adminRole._id,
    });

    await connection.close();
  }
}
