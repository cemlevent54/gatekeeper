import { IsString, IsBoolean, IsDateString } from 'class-validator';

export class GetPermissionDto {
    @IsString()
    id: string;

    @IsString()
    key: string;

    @IsString()
    description: string;

    @IsBoolean()
    isActive: boolean;

    @IsBoolean()
    isDeleted: boolean;

    @IsDateString()
    createdAt: Date;

    @IsDateString()
    updatedAt: Date;
}
