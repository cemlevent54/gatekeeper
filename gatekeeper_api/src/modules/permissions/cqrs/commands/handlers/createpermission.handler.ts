import { Injectable, ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission, PermissionDocument } from '../../../../../schemas/permission.schema';
import { GetPermissionDto } from '../../../dto/get-permission.dto';
import { CreatePermissionCommand } from '../impl/createpermissioncommand.impl';

@Injectable()
@CommandHandler(CreatePermissionCommand)
export class CreatePermissionHandler implements ICommandHandler<CreatePermissionCommand> {
    constructor(
        @InjectModel(Permission.name) private permissionModel: Model<PermissionDocument>,
    ) { }

    async execute(command: CreatePermissionCommand): Promise<GetPermissionDto> {
        const { createPermissionDto } = command;

        // Aynı key'e sahip permission var mı kontrol et
        const existingPermission = await this.permissionModel.findOne({
            key: createPermissionDto.key,
            isDeleted: false
        });

        if (existingPermission) {
            throw new ConflictException('Bu key\'e sahip bir izin zaten mevcut');
        }

        // Yeni permission oluştur
        const newPermission = new this.permissionModel({
            key: createPermissionDto.key,
            description: createPermissionDto.description || '',
            isActive: createPermissionDto.isActive !== undefined ? createPermissionDto.isActive : true,
            isDeleted: false,
        });

        const savedPermission = await newPermission.save();

        return {
            id: savedPermission._id.toString(),
            key: savedPermission.key,
            description: savedPermission.description,
            isActive: savedPermission.isActive,
            isDeleted: savedPermission.isDeleted,
            createdAt: (savedPermission as any).createdAt,
            updatedAt: (savedPermission as any).updatedAt,
        };
    }
}
