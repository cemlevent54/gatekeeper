import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../../schemas/role.schema';
import { GetRoleDto } from '../dto/get-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    ) { }

    async getAllRoles(): Promise<GetRoleDto[]> {
        const roles = await this.roleModel.find({ isDeleted: false })
            .sort({ createdAt: -1 })
            .lean();

        return roles.map(role => ({
            id: role._id.toString(),
            name: role.name,
            description: role.description,
            isActive: role.isActive,
            isDeleted: role.isDeleted,
            createdAt: (role as any).createdAt,
            updatedAt: (role as any).updatedAt,
        }));
    }

    async updateRole(roleId: string, updateData: UpdateRoleDto): Promise<GetRoleDto> {
        const role = await this.roleModel.findById(roleId);
        if (!role) {
            throw new NotFoundException('Rol bulunamadı');
        }

        // Güncellenebilir alanları güncelle
        if (updateData.name !== undefined) {
            role.name = updateData.name;
        }
        if (updateData.description !== undefined) {
            role.description = updateData.description;
        }
        if (updateData.isActive !== undefined) {
            role.isActive = updateData.isActive;
        }

        await role.save();

        // Güncellenmiş rol bilgilerini döndür
        return this.getRoleById(roleId);
    }

    async deleteRole(roleId: string): Promise<{ message: string }> {
        const role = await this.roleModel.findById(roleId);
        if (!role) {
            throw new NotFoundException('Rol bulunamadı');
        }

        // Soft delete - rolü silmek yerine sadece isDeleted flag'ini true yap
        role.isDeleted = true;
        await role.save();

        return { message: 'Rol başarıyla silindi' };
    }

    private async getRoleById(roleId: string): Promise<GetRoleDto> {
        const role = await this.roleModel.findById(roleId).lean();

        if (!role) {
            throw new NotFoundException('Rol bulunamadı');
        }

        return {
            id: role._id.toString(),
            name: role.name,
            description: role.description,
            isActive: role.isActive,
            isDeleted: role.isDeleted,
            createdAt: (role as any).createdAt,
            updatedAt: (role as any).updatedAt,
        };
    }
}
