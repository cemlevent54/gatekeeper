import { IsString, IsEmail, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class GetUserDto {
    @IsString()
    id: string;

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsString()
    role: string;

    @IsBoolean()
    isActive: boolean;

    @IsBoolean()
    isDeleted: boolean;

    @IsOptional()
    @IsDateString()
    verifiedAt?: Date | null;

    @IsDateString()
    createdAt: Date;

    @IsDateString()
    updatedAt: Date;

    @IsOptional()
    @IsDateString()
    lastLoginAt?: Date | null;

    @IsOptional()
    @IsString()
    profileImage?: string | null;
}
