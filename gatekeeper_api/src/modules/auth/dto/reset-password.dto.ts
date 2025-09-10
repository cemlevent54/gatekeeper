import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsNotEmpty({ message: 'OTP kodu gereklidir' })
    @IsString({ message: 'OTP kodu string olmalıdır' })
    @Length(6, 6, { message: 'OTP kodu 6 haneli olmalıdır' })
    otpCode: string;

    @IsNotEmpty({ message: 'Token gereklidir' })
    @IsString({ message: 'Token string olmalıdır' })
    token: string;

    @IsNotEmpty({ message: 'Yeni şifre gereklidir' })
    @IsString({ message: 'Şifre string olmalıdır' })
    @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
    password: string;
}
