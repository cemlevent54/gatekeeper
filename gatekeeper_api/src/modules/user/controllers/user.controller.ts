import { Controller, Get, Patch, Delete, Param, Body, UseGuards, Request, ValidationPipe, HttpStatus, Res, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CommandBus } from '@nestjs/cqrs';
import { GetAllUsersCommand } from '../cqrs/commands/impl/getalluserscommand.impl';
import { GetUserCommand } from '../cqrs/commands/impl/getusercommand.impl';
import { UpdateUserCommand } from '../cqrs/commands/impl/updateusercommand.impl';
import { DeleteUserCommand } from '../cqrs/commands/impl/deleteusercommand.impl';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { ApiResponse } from '../../../common/interfaces/api-response.interface';
import type { Response } from 'express';

@Controller('user')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
    constructor(private readonly commandBus: CommandBus) { }

    @Permissions('user.view')
    @Get()
    async getAllUsers(
        @Request() req: any,
        @Res() res: Response
    ) {
        try {
            const users = await this.commandBus.execute(new GetAllUsersCommand(
                req.user.sub
            ));

            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Kullanıcı listesi başarıyla getirildi',
                data: users
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Kullanıcı listesi getirilemedi',
                data: null
            });
        }
    }

    @Permissions('user.view')
    @Get(':id')
    async getUserById(
        @Param('id') userId: string,
        @Request() req: any,
        @Res() res: Response
    ) {
        try {
            const user = await this.commandBus.execute(new GetUserCommand(
                userId,
                req.user.sub
            ));

            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Kullanıcı bilgileri başarıyla getirildi',
                data: user
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Kullanıcı bilgileri getirilemedi',
                data: null
            });
        }
    }

    @Permissions('user.edit')
    @Patch(':id')
    async updateUser(
        @Param('id') userId: string,
        @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
        @Request() req: any,
        @Res() res: Response
    ) {
        try {
            const updatedUser = await this.commandBus.execute(new UpdateUserCommand(
                userId,
                updateUserDto,
                req.user.sub
            ));

            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Kullanıcı bilgileri başarıyla güncellendi',
                data: updatedUser
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Kullanıcı bilgileri güncellenemedi',
                data: null
            });
        }
    }

    @Permissions('user.delete')
    @Delete(':id')
    async deleteUser(
        @Param('id') userId: string,
        @Request() req: any,
        @Res() res: Response
    ) {
        try {
            const result = await this.commandBus.execute(new DeleteUserCommand(
                userId,
                req.user.sub
            ));

            return res.status(HttpStatus.OK).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Kullanıcı hesabı silinemedi',
                data: null
            });
        }
    }

    @Permissions('user.edit')
    @Post(':id/upload-avatar')
    @UseInterceptors(FileInterceptor('profileImage', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);
                cb(null, `avatar-${uniqueSuffix}${ext}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                cb(null, true);
            } else {
                cb(new Error('Sadece resim dosyaları kabul edilir (jpg, jpeg, png, gif)'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        }
    }))
    async uploadAvatar(
        @Param('id') userId: string,
        @UploadedFile() file: any,
        @Request() req: any,
        @Res() res: Response
    ) {
        try {
            if (!file) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Dosya yüklenmedi',
                    data: null
                });
            }

            // Dosya yolunu oluştur
            const fileUrl = `/uploads/avatars/${file.filename}`;

            // Kullanıcının profil resmini güncelle
            const updateData = { profileImage: fileUrl };
            const updatedUser = await this.commandBus.execute(new UpdateUserCommand(
                userId,
                updateData,
                req.user.sub
            ));

            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Profil resmi başarıyla yüklendi',
                data: {
                    user: updatedUser,
                    fileUrl: fileUrl
                }
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Profil resmi yüklenemedi',
                data: null
            });
        }
    }
}
