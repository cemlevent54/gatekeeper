import { Controller, Get, Post, Patch, Param, Body, UseGuards, ValidationPipe, HttpStatus, Res, SetMetadata } from '@nestjs/common';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { UpdateRolePermissionsDto } from '../dto/assign-permission-to-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { Response } from 'express';
import { PermissionsService } from '../services/permissions.service';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Permissions('permission.view', 'permission.*')
    @Get('matrix')
    async getRolePermissionMatrix(@Res() res: Response) {
        try {
            const matrix = await this.permissionsService.getRolePermissionMatrix();
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

    @Permissions('permission.view', 'permission.*')
    @Get()
    async getAllPermissions(@Res() res: Response) {
        try {
            const permissions = await this.permissionsService.getPermissions();
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

    @Permissions('permission.view', 'permission.*')
    @Get(':id')
    async getPermissionById(
        @Param('id') permissionId: string,
        @Res() res: Response
    ) {
        try {
            const permission = await this.permissionsService.getPermissions(permissionId);
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

    @Permissions('permission.create', 'permission.*')
    @Post()
    @SetMetadata('roles', ['admin'])
    @UseGuards(RolesGuard)
    async createPermission(
        @Body(new ValidationPipe()) createPermissionDto: CreatePermissionDto,
        @Res() res: Response
    ) {
        try {
            const newPermission = await this.permissionsService.createPermission(createPermissionDto);
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

    @Permissions('permission.update', 'permission.*')
    @Patch(':id')
    @SetMetadata('roles', ['admin'])
    @UseGuards(RolesGuard)
    async updatePermission(
        @Param('id') permissionId: string,
        @Body(new ValidationPipe()) updatePermissionDto: UpdatePermissionDto,
        @Res() res: Response
    ) {
        try {
            const updatedPermission = await this.permissionsService.updatePermission(
                permissionId,
                updatePermissionDto
            );
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

    @Permissions('permission.view', 'permission.*')
    @Get('user/:userId')
    async getUserPermissions(
        @Param('userId') userId: string,
        @Res() res: Response
    ) {
        try {
            const userPermissions = await this.permissionsService.getUserPermissions(userId);
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

    @Permissions('permission.view', 'permission.*')
    @Get('role/:roleId')
    async getRolePermissions(
        @Param('roleId') roleId: string,
        @Res() res: Response
    ) {
        try {
            const rolePermissions = await this.permissionsService.getRolePermissions(roleId);
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

    @Permissions('permission.update', 'permission.*')
    @Patch('role/:roleId/assign')
    @SetMetadata('roles', ['admin'])
    @UseGuards(RolesGuard)
    async updateRolePermissions(
        @Param('roleId') roleId: string,
        @Body(new ValidationPipe()) updateRolePermissionsDto: UpdateRolePermissionsDto,
        @Res() res: Response
    ) {
        try {
            const updatedRole = await this.permissionsService.updateRolePermissions(
                roleId,
                updateRolePermissionsDto
            );
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
