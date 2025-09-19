import { IsString, IsArray, IsBoolean, IsDateString } from 'class-validator';

export class PermissionMatrixItemDto {
    @IsString()
    id: string;

    @IsString()
    key: string;

    @IsString()
    description: string;

    @IsBoolean()
    isActive: boolean;

    @IsDateString()
    createdAt: Date;
}

export class RoleMatrixItemDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsBoolean()
    isActive: boolean;

    @IsArray()
    permissions: PermissionMatrixItemDto[];

    @IsDateString()
    createdAt: Date;
}

export class RolePermissionMatrixDto {
    @IsArray()
    roles: RoleMatrixItemDto[];

    @IsArray()
    permissions: PermissionMatrixItemDto[];
}
