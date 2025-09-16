import { Controller, Get, Patch, Delete, Param, Body, UseGuards, ValidationPipe, HttpStatus, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetAllRolesCommand } from '../cqrs/commands/impl/getallrolescommand.impl';
import { UpdateRoleCommand } from '../cqrs/commands/impl/updaterolecommand.impl';
import { DeleteRoleCommand } from '../cqrs/commands/impl/deleterolecommand.impl';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { Response } from 'express';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
    constructor(private readonly commandBus: CommandBus) { }

    @Get()
    async getAllRoles(@Res() res: Response) {
        try {
            const roles = await this.commandBus.execute(new GetAllRolesCommand());
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

    @Patch(':id')
    async updateRole(
        @Param('id') roleId: string,
        @Body(new ValidationPipe()) updateRoleDto: UpdateRoleDto,
        @Res() res: Response
    ) {
        try {
            const updatedRole = await this.commandBus.execute(new UpdateRoleCommand(
                roleId,
                updateRoleDto
            ));
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

    @Delete(':id')
    async deleteRole(
        @Param('id') roleId: string,
        @Res() res: Response
    ) {
        try {
            const result = await this.commandBus.execute(new DeleteRoleCommand(roleId));
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
