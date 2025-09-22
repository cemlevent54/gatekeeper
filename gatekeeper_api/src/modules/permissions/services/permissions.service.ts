import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';
import { RoleRepository } from '../repositories/role.repository';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { UpdateRolePermissionsDto } from '../dto/assign-permission-to-role.dto';

@Injectable()
export class PermissionsService {
    constructor(
        private readonly permissionRepository: PermissionRepository,
        private readonly roleRepository: RoleRepository,
    ) { }

    async getPermissions(permissionId?: string) {
        if (permissionId) {
            const permission = await this.permissionRepository.findByIdLean(permissionId);
            if (!permission) throw new NotFoundException('İzin bulunamadı');
            return {
                id: permission._id.toString(),
                key: permission.key,
                description: permission.description,
                isActive: permission.isActive,
                isDeleted: permission.isDeleted,
                createdAt: (permission as any).createdAt,
                updatedAt: (permission as any).updatedAt,
            };
        }
        const permissions = await this.permissionRepository.findAllActiveSorted();
        return permissions.map((p: any) => ({
            id: p._id.toString(),
            key: p.key,
            description: p.description,
            isActive: p.isActive,
            isDeleted: p.isDeleted,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));
    }

    async createPermission(dto: CreatePermissionDto) {
        const created = await this.permissionRepository.create({
            key: dto.key,
            description: dto.description,
            isActive: dto.isActive ?? true,
        });
        const lean = (await this.permissionRepository.findByIdLean(String((created as any)._id))) as any;
        return {
            id: lean._id.toString(),
            key: lean.key,
            description: lean.description,
            isActive: lean.isActive,
            isDeleted: lean.isDeleted,
            createdAt: lean.createdAt,
            updatedAt: lean.updatedAt,
        };
    }

    async updatePermission(permissionId: string, dto: UpdatePermissionDto) {
        const updated = await this.permissionRepository.updateById(permissionId, dto as any);
        if (!updated) throw new NotFoundException('İzin bulunamadı');
        return {
            id: updated._id.toString(),
            key: updated.key,
            description: updated.description,
            isActive: updated.isActive,
            isDeleted: updated.isDeleted,
            createdAt: (updated as any).createdAt,
            updatedAt: (updated as any).updatedAt,
        };
    }

    async getRolePermissionMatrix() {
        const [roles, permissions] = await Promise.all([
            this.roleRepository.findAllActiveWithPermissionsLean(),
            this.permissionRepository.findAllActiveSorted(),
        ]);

        const roleItems = roles.map((r: any) => ({
            id: r._id.toString(),
            name: r.name,
            description: r.description,
            isActive: r.isActive,
            permissions: (r.permissions || []).map((p: any) => ({
                id: p._id.toString(),
                key: p.key,
                description: p.description,
                isActive: p.isActive,
                createdAt: (p as any).createdAt,
            })),
            createdAt: (r as any).createdAt,
        }));

        const permissionItems = permissions.map((p: any) => ({
            id: p._id.toString(),
            key: p.key,
            description: p.description,
            isActive: p.isActive,
            createdAt: (p as any).createdAt,
        }));

        return { roles: roleItems, permissions: permissionItems };
    }

    async getUserPermissions(userId: string) {
        // Bu projede izin kontrolü roller üzerinden yapılıyor; rolün permissions alanını referans alır
        // İhtiyaç halinde UserRepository eklenip doğrudan kullanıcıdan da okunabilir
        throw new Error('getUserPermissions: Henüz uygulanmadı');
    }

    async getRolePermissions(roleId: string) {
        const role = await this.roleRepository.findByIdWithPermissionsLean(roleId);
        if (!role) throw new NotFoundException('Rol bulunamadı');
        return (role.permissions || []).map((p: any) => ({
            id: p._id.toString(),
            key: p.key,
            description: p.description,
            isActive: p.isActive,
        }));
    }

    async updateRolePermissions(roleId: string, dto: UpdateRolePermissionsDto) {
        const updatedRole = await this.roleRepository.updatePermissions(roleId, dto.permissionIds);
        if (!updatedRole) throw new NotFoundException('Rol bulunamadı');
        return updatedRole;
    }
}


