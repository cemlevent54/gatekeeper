import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../../../../../schemas/permission.schema';
import { GetPermissionDto } from '../../../dto/get-permission.dto';
import { UpdatePermissionCommand } from '../impl/updatepermissioncommand.impl';

@Injectable()
@CommandHandler(UpdatePermissionCommand)
export class UpdatePermissionHandler implements ICommandHandler<UpdatePermissionCommand> {
    constructor(
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    ) { }

    async execute(command: UpdatePermissionCommand): Promise<GetPermissionDto> {
        const { permissionId, updatePermissionDto } = command;

        // Permission'ı bul
        const permission = await this.permissionModel.findById(permissionId);
        if (!permission) {
            throw new NotFoundException('İzin bulunamadı');
        }

        // Eğer key güncelleniyorsa, aynı key'e sahip başka permission var mı kontrol et
        if (updatePermissionDto.key && updatePermissionDto.key !== permission.key) {
            const existingPermission = await this.permissionModel.findOne({
                key: updatePermissionDto.key,
                isDeleted: false,
                _id: { $ne: permissionId }
            });

            if (existingPermission) {
                throw new ConflictException('Bu key\'e sahip bir izin zaten mevcut');
            }
        }

        // Güncellenebilir alanları güncelle
        if (updatePermissionDto.key !== undefined) {
            permission.key = updatePermissionDto.key;
        }
        if (updatePermissionDto.description !== undefined) {
            permission.description = updatePermissionDto.description;
        }
        if (updatePermissionDto.isActive !== undefined) {
            permission.isActive = updatePermissionDto.isActive;
        }

        const updatedPermission = await permission.save();

        return {
            id: updatedPermission._id.toString(),
            key: updatedPermission.key,
            description: updatedPermission.description,
            isActive: updatedPermission.isActive,
            isDeleted: updatedPermission.isDeleted,
            createdAt: (updatedPermission as any).createdAt,
            updatedAt: (updatedPermission as any).updatedAt,
        };
    }
}
