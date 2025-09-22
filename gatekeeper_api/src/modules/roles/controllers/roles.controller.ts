import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ValidationPipe, HttpStatus, Res } from '@nestjs/common';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { Response } from 'express';
import { RolesService } from '../services/roles.service';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Permissions('role.view', 'role.*')
    @Get()
    async getAllRoles(@Res() res: Response) {
        try {
            const roles = await this.rolesService.getAllRoles();
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Roller başarıyla getirildi',
                data: roles
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Roller getirilemedi',
                data: null
            });
        }
    }

    @Permissions('role.create', 'role.*')
    @Post()
    async createRole(
        @Body(new ValidationPipe()) createRoleDto: CreateRoleDto,
        @Res() res: Response
    ) {
        try {
            const newRole = await this.rolesService.createRole(createRoleDto);
            return res.status(HttpStatus.CREATED).json({
                success: true,
                message: 'Rol başarıyla oluşturuldu',
                data: newRole
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Rol oluşturulamadı',
                data: null
            });
        }
    }

    @Permissions('role.update', 'role.*')
    @Patch(':id')
    async updateRole(
        @Param('id') roleId: string,
        @Body(new ValidationPipe()) updateRoleDto: UpdateRoleDto,
        @Res() res: Response
    ) {
        try {
            const updatedRole = await this.rolesService.updateRole(
                roleId,
                updateRoleDto
            );
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Rol başarıyla güncellendi',
                data: updatedRole
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Rol güncellenemedi',
                data: null
            });
        }
    }

    @Permissions('role.delete', 'role.*')
    @Delete(':id')
    async deleteRole(
        @Param('id') roleId: string,
        @Res() res: Response
    ) {
        try {
            const result = await this.rolesService.deleteRole(roleId);
            return res.status(HttpStatus.OK).json({
                success: true,
                message: result.message,
                data: result
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Rol silinemedi',
                data: null
            });
        }
    }
}
