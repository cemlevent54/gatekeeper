import { Controller, Get, Post, Patch, Param, Body, UseGuards, ValidationPipe, HttpStatus, Res, SetMetadata } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetPermissionsCommand } from '../cqrs/commands/impl/getpermissionscommand.impl';
import { CreatePermissionCommand } from '../cqrs/commands/impl/createpermissioncommand.impl';
import { UpdatePermissionCommand } from '../cqrs/commands/impl/updatepermissioncommand.impl';
import { GetUserPermissionsCommand } from '../cqrs/commands/impl/getuserpermissionscommand.impl';
import { GetRolePermissionsCommand } from '../cqrs/commands/impl/getrolepermissionscommand.impl';
import { GetRolePermissionMatrixCommand } from '../cqrs/commands/impl/getrolepermissionmatrixcommand.impl';
import { UpdateRolePermissionsCommand } from '../cqrs/commands/impl/updaterolepermissionscommand.impl';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { UpdateRolePermissionsDto } from '../dto/assign-permission-to-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { Response } from 'express';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
    constructor(private readonly commandBus: CommandBus) { }

    @Get('matrix')
    async getRolePermissionMatrix(@Res() res: Response) {
        try {
            const matrix = await this.commandBus.execute(new GetRolePermissionMatrixCommand());
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Rol-izin matrisi başarıyla getirildi',
                data: matrix
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Rol-izin matrisi getirilemedi',
                data: null
            });
        }
    }

    @Get()
    async getAllPermissions(@Res() res: Response) {
        try {
            const permissions = await this.commandBus.execute(new GetPermissionsCommand());
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'İzinler başarıyla getirildi',
                data: permissions
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'İzinler getirilemedi',
                data: null
            });
        }
    }

    @Get(':id')
    async getPermissionById(
        @Param('id') permissionId: string,
        @Res() res: Response
    ) {
        try {
            const permission = await this.commandBus.execute(new GetPermissionsCommand(permissionId));
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'İzin başarıyla getirildi',
                data: permission
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'İzin getirilemedi',
                data: null
            });
        }
    }

    @Post()
    @SetMetadata('roles', ['admin'])
    @UseGuards(RolesGuard)
    async createPermission(
        @Body(new ValidationPipe()) createPermissionDto: CreatePermissionDto,
        @Res() res: Response
    ) {
        try {
            const newPermission = await this.commandBus.execute(new CreatePermissionCommand(createPermissionDto));
            return res.status(HttpStatus.CREATED).json({
                success: true,
                message: 'İzin başarıyla oluşturuldu',
                data: newPermission
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'İzin oluşturulamadı',
                data: null
            });
        }
    }

    @Patch(':id')
    @SetMetadata('roles', ['admin'])
    @UseGuards(RolesGuard)
    async updatePermission(
        @Param('id') permissionId: string,
        @Body(new ValidationPipe()) updatePermissionDto: UpdatePermissionDto,
        @Res() res: Response
    ) {
        try {
            const updatedPermission = await this.commandBus.execute(new UpdatePermissionCommand(
                permissionId,
                updatePermissionDto
            ));
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'İzin başarıyla güncellendi',
                data: updatedPermission
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'İzin güncellenemedi',
                data: null
            });
        }
    }

    @Get('user/:userId')
    async getUserPermissions(
        @Param('userId') userId: string,
        @Res() res: Response
    ) {
        try {
            const userPermissions = await this.commandBus.execute(new GetUserPermissionsCommand(userId));
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Kullanıcı izinleri başarıyla getirildi',
                data: userPermissions
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Kullanıcı izinleri getirilemedi',
                data: null
            });
        }
    }

    @Get('role/:roleId')
    async getRolePermissions(
        @Param('roleId') roleId: string,
        @Res() res: Response
    ) {
        try {
            const rolePermissions = await this.commandBus.execute(new GetRolePermissionsCommand(roleId));
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Rol izinleri başarıyla getirildi',
                data: rolePermissions
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Rol izinleri getirilemedi',
                data: null
            });
        }
    }

    @Patch('role/:roleId/assign')
    @SetMetadata('roles', ['admin'])
    @UseGuards(RolesGuard)
    async updateRolePermissions(
        @Param('roleId') roleId: string,
        @Body(new ValidationPipe()) updateRolePermissionsDto: UpdateRolePermissionsDto,
        @Res() res: Response
    ) {
        try {
            const updatedRole = await this.commandBus.execute(new UpdateRolePermissionsCommand(
                roleId,
                updateRolePermissionsDto
            ));
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Rol izinleri başarıyla güncellendi',
                data: updatedRole
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Rol izinleri güncellenemedi',
                data: null
            });
        }
    }
}
