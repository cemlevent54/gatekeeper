import { IsString, IsArray, IsOptional } from 'class-validator';

export class AssignPermissionToRoleDto {
    @IsString()
    roleId: string;

    @IsArray()
    @IsString({ each: true })
    permissionIds: string[];
}

export class UpdateRolePermissionsDto {
    @IsArray()
    @IsString({ each: true })
    permissionIds: string[];
}
