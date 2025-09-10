import { Controller, Post, Body, ValidationPipe, HttpStatus, Res } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterCommand } from '../cqrs/commands/impl/registercommand.impl';
import { LoginCommand } from '../cqrs/commands/impl/logincommand.impl';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
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
            const user = await this.commandBus.execute(new LoginCommand(
                loginDto.usernameOrEmail,
                loginDto.password,
            ));
            if (!user) {
                return res.status(HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    message: 'Invalid credentials',
                    data: null,
                });
            }
            return res.status(HttpStatus.OK).json({
                success: true,
                message: 'Login successful',
                data: user,
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
}
