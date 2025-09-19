import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    permissions?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
