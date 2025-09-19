import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../../../../../schemas/permission.schema';
import { GetPermissionDto } from '../../../dto/get-permission.dto';
import { GetPermissionsCommand } from '../impl/getpermissionscommand.impl';

@Injectable()
@CommandHandler(GetPermissionsCommand)
export class GetPermissionsHandler implements ICommandHandler<GetPermissionsCommand> {
    constructor(
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    ) { }

    async execute(command: GetPermissionsCommand): Promise<GetPermissionDto | GetPermissionDto[]> {
        const { permissionId } = command;

        if (permissionId) {
            // Tek permission getir
            const permission = await this.permissionModel.findById(permissionId).lean();
            if (!permission) {
                throw new NotFoundException('İzin bulunamadı');
            }

            return {
                id: permission._id.toString(),
                key: permission.key,
                description: permission.description,
                isActive: permission.isActive,
                isDeleted: permission.isDeleted,
                createdAt: (permission as any).createdAt,
                updatedAt: (permission as any).updatedAt,
            };
        } else {
            // Tüm permissions getir
            const permissions = await this.permissionModel.find({ isDeleted: false })
                .sort({ createdAt: -1 })
                .lean();

            return permissions.map(permission => ({
                id: permission._id.toString(),
                key: permission.key,
                description: permission.description,
                isActive: permission.isActive,
                isDeleted: permission.isDeleted,
                createdAt: (permission as any).createdAt,
                updatedAt: (permission as any).updatedAt,
            }));
        }
    }
}
