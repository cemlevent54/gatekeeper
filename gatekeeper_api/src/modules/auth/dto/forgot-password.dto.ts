import { IsNotEmpty, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
    @IsNotEmpty({ message: 'Email adresi gereklidir' })
    @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
    email: string;
}
