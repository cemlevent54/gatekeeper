import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
    @IsNotEmpty({ message: 'Refresh token gereklidir' })
    @IsString({ message: 'Refresh token string olmalıdır' })
    refreshToken: string;
}
