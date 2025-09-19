import { IsString, IsArray, IsDateString } from 'class-validator';
import { PermissionInfoDto } from './user-permissions.dto';

export class RolePermissionDto {
    @IsString()
    roleId: string;

    @IsString()
    roleName: string;

    @IsString()
    roleDescription: string;

    @IsArray()
    permissions: PermissionInfoDto[];

    @IsDateString()
    createdAt: Date;

    @IsDateString()
    updatedAt: Date;
}
