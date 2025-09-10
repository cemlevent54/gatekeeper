import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
    @IsNotEmpty({ message: 'OTP kodu gereklidir' })
    @IsString({ message: 'OTP kodu string olmalıdır' })
    @Length(6, 6, { message: 'OTP kodu 6 haneli olmalıdır' })
    otpCode: string;

    @IsNotEmpty({ message: 'Token gereklidir' })
    @IsString({ message: 'Token string olmalıdır' })
    token: string;
}
