import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { GetRoleDto } from '../dto/get-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleDto } from '../dto/create-role.dto';

@Injectable()
export class RolesService {
    constructor(
        private readonly roleRepository: RoleRepository,
    ) { }

    async createRole(dto: CreateRoleDto): Promise<GetRoleDto> {
        const existing = await this.roleRepository.findByNameActive(dto.name);
        if (existing) {
            throw new ConflictException('Bu isimde bir rol zaten mevcut');
        }

        const created = await this.roleRepository.create({
            name: dto.name,
            description: dto.description || '',
            isActive: dto.isActive !== undefined ? dto.isActive : true,
            isDeleted: false,
            permissions: [],
        } as any);

        const role = await this.roleRepository.findByIdLean(String((created as any)._id));
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

    async getAllRoles(): Promise<GetRoleDto[]> {
        const roles = await this.roleRepository.findAllActiveSorted();

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
        const role = await this.roleRepository.findById(roleId);
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

        await this.roleRepository.save(role);

        // Güncellenmiş rol bilgilerini döndür
        return this.getRoleById(roleId);
    }

    async deleteRole(roleId: string): Promise<{ message: string }> {
        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new NotFoundException('Rol bulunamadı');
        }

        // Soft delete - rolü silmek yerine sadece isDeleted flag'ini true yap
        role.isDeleted = true;
        await role.save();

        return { message: 'Rol başarıyla silindi' };
    }

    private async getRoleById(roleId: string): Promise<GetRoleDto> {
        const role = await this.roleRepository.findByIdLean(roleId);

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
