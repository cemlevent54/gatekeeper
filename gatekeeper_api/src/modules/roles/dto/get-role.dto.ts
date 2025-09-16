import { IsString, IsBoolean, IsDateString } from 'class-validator';

export class GetRoleDto {
    @IsString()
    id: string;

    @IsString()
    name: string;

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
