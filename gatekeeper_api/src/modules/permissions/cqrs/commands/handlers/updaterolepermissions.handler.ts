import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from '../../../../../schemas/role.schema';
import { Permission, PermissionDocument } from '../../../../../schemas/permission.schema';
import { UpdateRolePermissionsCommand } from '../impl/updaterolepermissionscommand.impl';
import { GetRoleDto } from '../../../../roles/dto/get-role.dto';

@Injectable()
@CommandHandler(UpdateRolePermissionsCommand)
export class UpdateRolePermissionsHandler implements ICommandHandler<UpdateRolePermissionsCommand> {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    ) { }

    async execute(command: UpdateRolePermissionsCommand): Promise<GetRoleDto> {
        const { roleId, updateRolePermissionsDto } = command;

        // Rolü bul
        const role = await this.roleModel.findById(roleId);
        if (!role) {
            throw new NotFoundException('Rol bulunamadı');
        }

        // Permission ID'lerini ObjectId'ye çevir
        const permissionObjectIds = updateRolePermissionsDto.permissionIds.map(id => new Types.ObjectId(id));

        // Permission'ların var olduğunu kontrol et
        const permissions = await this.permissionModel.find({
            _id: { $in: permissionObjectIds },
            isActive: true,
            isDeleted: false
        });

        if (permissions.length !== permissionObjectIds.length) {
            throw new NotFoundException('Bazı izinler bulunamadı veya aktif değil');
        }

        // Rolün permission'larını güncelle
        role.permissions = permissionObjectIds as any;
        const updatedRole = await role.save();

        // Güncellenmiş rolü populate ile getir
        const populatedRole = await this.roleModel.findById(updatedRole._id).populate('permissions').lean();

        if (!populatedRole) {
            throw new NotFoundException('Güncellenmiş rol bulunamadı');
        }

        return {
            id: populatedRole._id.toString(),
            name: populatedRole.name,
            description: populatedRole.description,
            isActive: populatedRole.isActive,
            isDeleted: populatedRole.isDeleted,
            permissions: populatedRole.permissions.map((permission: any) => ({
                id: permission._id.toString(),
                key: permission.key,
                description: permission.description,
                isActive: permission.isActive,
                createdAt: permission.createdAt,
            })),
            createdAt: (populatedRole as any).createdAt,
            updatedAt: (populatedRole as any).updatedAt,
        };
    }
}
