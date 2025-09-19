import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateRoleCommand } from '../commands/impl/createrolecommand.impl';
import { Role, RoleDocument } from '../../../../schemas/role.schema';
import { HttpException, HttpStatus } from '@nestjs/common';

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
    constructor(
        @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    ) { }

    async execute(command: CreateRoleCommand): Promise<Role> {
        const { createRoleDto } = command;

        try {
            // Aynı isimde rol var mı kontrol et
            const existingRole = await this.roleModel.findOne({
                name: createRoleDto.name,
                isDeleted: false
            });

            if (existingRole) {
                throw new HttpException(
                    'Bu isimde bir rol zaten mevcut',
                    HttpStatus.CONFLICT
                );
            }

            // Yeni rol oluştur
            const newRole = new this.roleModel({
                name: createRoleDto.name,
                description: createRoleDto.description || '',
                permissions: [], // Boş array olarak başlat
                isActive: createRoleDto.isActive !== undefined ? createRoleDto.isActive : true,
                isDeleted: false,
                userCount: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            const savedRole = await newRole.save();

            console.log(`[CreateRoleHandler][${new Date().toISOString()}] INFO -- Yeni rol oluşturuldu: ${savedRole.name}`);

            return savedRole;
        } catch (error) {
            console.error(`[CreateRoleHandler][${new Date().toISOString()}] ERROR -- Rol oluşturulurken hata:`, error);

            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException(
                'Rol oluşturulurken bir hata oluştu',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
