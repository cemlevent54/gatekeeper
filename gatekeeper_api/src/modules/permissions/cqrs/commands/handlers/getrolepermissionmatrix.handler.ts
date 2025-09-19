import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from '../../../../../schemas/role.schema';
import { Permission, PermissionDocument } from '../../../../../schemas/permission.schema';
import { GetRolePermissionMatrixCommand } from '../impl/getrolepermissionmatrixcommand.impl';
import { RolePermissionMatrixDto, RoleMatrixItemDto, PermissionMatrixItemDto } from '../../../dto/role-permission-matrix.dto';

@Injectable()
@CommandHandler(GetRolePermissionMatrixCommand)
export class GetRolePermissionMatrixHandler implements ICommandHandler<GetRolePermissionMatrixCommand> {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    ) { }

    async execute(command: GetRolePermissionMatrixCommand): Promise<RolePermissionMatrixDto> {
        // Tüm aktif rolleri getir
        const roles = await this.roleModel.find({
            isActive: true,
            isDeleted: false
        }).populate('permissions').lean();

        // Tüm aktif permission'ları getir
        const permissions = await this.permissionModel.find({
            isActive: true,
            isDeleted: false
        }).lean();

        // Permission'ları matrix item formatına çevir
        const permissionMatrixItems: PermissionMatrixItemDto[] = permissions.map(permission => ({
            id: permission._id.toString(),
            key: permission.key,
            description: permission.description,
            isActive: permission.isActive,
            createdAt: (permission as any).createdAt,
        }));

        // Rolleri matrix item formatına çevir
        const roleMatrixItems: RoleMatrixItemDto[] = roles.map(role => {
            const rolePermissions = role.permissions || [];
            const permissionItems: PermissionMatrixItemDto[] = rolePermissions.map((permission: any) => ({
                id: permission._id.toString(),
                key: permission.key,
                description: permission.description,
                isActive: permission.isActive,
                createdAt: permission.createdAt,
            }));

            return {
                id: role._id.toString(),
                name: role.name,
                description: role.description,
                isActive: role.isActive,
                permissions: permissionItems,
                createdAt: (role as any).createdAt,
            };
        });

        return {
            roles: roleMatrixItems,
            permissions: permissionMatrixItems,
        };
    }
}
