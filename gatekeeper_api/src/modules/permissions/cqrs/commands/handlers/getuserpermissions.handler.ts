import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../../../schemas/user.schema';
import { Role, RoleDocument } from '../../../../../schemas/role.schema';
import { Permission, PermissionDocument } from '../../../../../schemas/permission.schema';
import { UserPermissionDto, PermissionInfoDto } from '../../../dto/user-permissions.dto';
import { GetUserPermissionsCommand } from '../impl/getuserpermissionscommand.impl';

@Injectable()
@CommandHandler(GetUserPermissionsCommand)
export class GetUserPermissionsHandler implements ICommandHandler<GetUserPermissionsCommand> {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    ) { }

    async execute(command: GetUserPermissionsCommand): Promise<UserPermissionDto> {
        const { userId } = command;

        // Kullanıcıyı bul
        const user = await this.userModel.findById(userId).lean();
        if (!user) {
            throw new NotFoundException('Kullanıcı bulunamadı');
        }

        // Kullanıcının rolünü bul
        const role = await this.roleModel.findOne({ name: user.role, isDeleted: false }).lean();
        if (!role) {
            throw new NotFoundException('Kullanıcının rolü bulunamadı');
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
            userId: user._id.toString(),
            roleId: role._id.toString(),
            roleName: role.name,
            permissions: permissionInfos,
        };
    }
}
