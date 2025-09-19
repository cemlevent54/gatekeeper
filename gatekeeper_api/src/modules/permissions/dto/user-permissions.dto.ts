import { IsString, IsArray, IsDateString } from 'class-validator';

export class PermissionInfoDto {
    @IsString()
    id: string;

    @IsString()
    key: string;

    @IsString()
    description: string;

    @IsDateString()
    createdAt: Date;
}

export class UserPermissionDto {
    @IsString()
    userId: string;

    @IsString()
    roleId: string;

    @IsString()
    roleName: string;

    @IsArray()
    permissions: PermissionInfoDto[];
}
