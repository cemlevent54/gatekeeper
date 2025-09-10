import { Controller, Post, Body, ValidationPipe, HttpStatus, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from '../cqrs/commands/impl/registercommand.impl';
import { LoginCommand } from '../cqrs/commands/impl/logincommand.impl';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { LogoutDto } from '../dto/logout.dto';
import { VerifyEmailCommand } from '../cqrs/commands/impl/verifyemailcommand.impl';
import { ForgotPasswordCommand } from '../cqrs/commands/impl/forgotpasswordcommand.impl';
import { ResetPasswordCommand } from '../cqrs/commands/impl/resetpasswordcommand.impl';
import { LogoutCommand } from '../cqrs/commands/impl/logoutcommand.impl';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post('register')
    async register(@Body(new ValidationPipe()) registerDto: RegisterDto, @Res() res: Response) {
        try {
            // CQRS - CommandBus ile kayıt komutunu çalıştır
            const result = await this.commandBus.execute(new RegisterCommand(
                registerDto.username,
                registerDto.email,
                registerDto.password,
            ));
            if (result?.reactivated) {
                return res.status(HttpStatus.OK).json({
                    success: true,
                    message: 'User reactivated successfully',
                    data: result.user,
                });
            }
            return res.status(HttpStatus.CREATED).json({
                success: true,
                message: 'User registered successfully',
                data: result.user,
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'User registration failed',
                data: null,
            });
        }
    }

    @Post('login')
    async login(@Body(new ValidationPipe()) loginDto: LoginDto, @Res() res: Response) {
        try {
            const loginResult = await this.commandBus.execute(new LoginCommand(
                loginDto.usernameOrEmail,
                loginDto.password,
            ));
            if (!loginResult) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid credentials',
                    data: null,
                });
            }
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Login successful',
                data: loginResult,
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Login failed',
                data: null,
            });
        }
    }

    @Post('verify-email')
    async verifyEmail(@Body(new ValidationPipe()) verifyEmailDto: VerifyEmailDto, @Res() res: Response) {
        try {
            const result = await this.commandBus.execute(new VerifyEmailCommand(
                verifyEmailDto.otpCode,
                verifyEmailDto.token,
            ));

            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: result.message,
                    data: null,
                });
            }

            return res.status(HttpStatus.OK).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Email verification failed',
                data: null,
            });
        }
    }

    @Post('forgot-password')
    async forgotPassword(@Body(new ValidationPipe()) forgotPasswordDto: ForgotPasswordDto, @Res() res: Response) {
        try {
            const result = await this.commandBus.execute(new ForgotPasswordCommand(
                forgotPasswordDto.email,
            ));

            return res.status(HttpStatus.OK).json({
                success: result.success,
                message: result.message,
                data: null,
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Şifre sıfırlama isteği başarısız',
                data: null,
            });
        }
    }

    @Post('reset-password')
    async resetPassword(@Body(new ValidationPipe()) resetPasswordDto: ResetPasswordDto, @Res() res: Response) {
        try {
            const result = await this.commandBus.execute(new ResetPasswordCommand(
                resetPasswordDto.otpCode,
                resetPasswordDto.token,
                resetPasswordDto.password,
            ));

            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: result.message,
                    data: null,
                });
            }

            return res.status(HttpStatus.OK).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Şifre sıfırlama başarısız',
                data: null,
            });
        }
    }

    @Post('logout')
    async logout(@Body(new ValidationPipe()) logoutDto: LogoutDto, @Res() res: Response) {
        try {
            const result = await this.commandBus.execute(new LogoutCommand(
                logoutDto.refreshToken,
            ));

            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: result.message,
                    data: null,
                });
            }

            return res.status(HttpStatus.OK).json({
                success: true,
                message: result.message,
                data: null,
            });
        } catch (err: any) {
            const status = err?.status ?? HttpStatus.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: err?.message || 'Çıkış işlemi başarısız',
                data: null,
            });
        }
    }
}
