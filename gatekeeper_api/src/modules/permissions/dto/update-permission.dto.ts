import { IsString, IsOptional, IsBoolean, MinLength, MaxLength } from 'class-validator';

export class UpdatePermissionDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    key?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
