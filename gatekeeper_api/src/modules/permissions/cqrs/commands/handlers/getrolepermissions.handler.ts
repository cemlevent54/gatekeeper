import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../../../../schemas/role.schema';
import { Permission, PermissionDocument } from '../../../../../schemas/permission.schema';
import { RolePermissionDto } from '../../../dto/role-permissions.dto';
import { PermissionInfoDto } from '../../../dto/user-permissions.dto';
import { GetRolePermissionsCommand } from '../impl/getrolepermissionscommand.impl';

@Injectable()
@CommandHandler(GetRolePermissionsCommand)
export class GetRolePermissionsHandler implements ICommandHandler<GetRolePermissionsCommand> {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    ) { }

    async execute(command: GetRolePermissionsCommand): Promise<RolePermissionDto> {
        const { roleId } = command;

        // Rolü bul
        const role = await this.roleModel.findById(roleId).lean();
        if (!role) {
            throw new NotFoundException('Rol bulunamadı');
        }

        // Role'e ait permissions'ları bul
        // Not: Bu örnekte role-permission ilişkisi için ayrı bir collection olabilir
        // Şimdilik tüm aktif permissions'ları döndürüyoruz
        const permissions = await this.permissionModel.find({
            isActive: true,
            isDeleted: false
        }).lean();

        const permissionInfos: PermissionInfoDto[] = permissions.map(permission => ({
            id: permission._id.toString(),
            key: permission.key,
            description: permission.description,
            createdAt: (permission as any).createdAt,
        }));

        return {
            roleId: role._id.toString(),
            roleName: role.name,
            roleDescription: role.description,
            permissions: permissionInfos,
            createdAt: (role as any).createdAt,
            updatedAt: (role as any).updatedAt,
        };
    }
}
