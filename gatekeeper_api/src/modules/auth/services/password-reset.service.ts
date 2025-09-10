import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../schemas/user.schema';
import { EmailService } from '../../mail/email.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';

export interface PasswordResetData {
    userId: string;
    otpCode: string;
    token: string;
    expiresAt: Date;
    isUsed: boolean;
}

@Injectable()
export class PasswordResetService {
    private resetData = new Map<string, PasswordResetData>();

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly emailService: EmailService,
    ) { }

    /**
     * 6 haneli OTP kodu üretir
     */
    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Şifre sıfırlama için JWT token üretir
     */
    private generateResetToken(userId: string, otpCode: string): string {
        const payload = {
            sub: userId,
            otpCode: otpCode,
            type: 'password_reset',
            iat: Math.floor(Date.now() / 1000),
        };

        const secret = process.env.JWT_PASSWORD_RESET_SECRET || 'password-reset-secret';
        const expiresIn = '15m'; // 15 dakika

        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Şifre sıfırlama verilerini oluşturur ve saklar
     */
    public createResetData(userId: string): { otpCode: string; token: string } {
        const otpCode = this.generateOTP();
        const token = this.generateResetToken(userId, otpCode);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

        this.resetData.set(token, {
            userId,
            otpCode,
            token,
            expiresAt,
            isUsed: false,
        });

        return { otpCode, token };
    }

    /**
     * Şifre sıfırlama verilerini doğrular
     */
    public verifyResetData(token: string, otpCode: string): { isValid: boolean; userId?: string; error?: string } {
        try {
            // JWT token'ı doğrula
            const secret = process.env.JWT_PASSWORD_RESET_SECRET || 'password-reset-secret';
            const decoded = jwt.verify(token, secret) as any;

            // Token tipini kontrol et
            if (decoded.type !== 'password_reset') {
                return { isValid: false, error: 'Invalid token type' };
            }

            // OTP kodunu kontrol et
            if (decoded.otpCode !== otpCode) {
                return { isValid: false, error: 'Invalid OTP code' };
            }

            // Memory'deki kullanım durumunu kontrol et
            const data = this.resetData.get(token);
            if (data && data.isUsed) {
                return { isValid: false, error: 'Token already used' };
            }

            return { isValid: true, userId: decoded.sub };

        } catch (error) {
            return { isValid: false, error: 'Invalid or expired token' };
        }
    }

    /**
     * Token'ı kullanıldı olarak işaretler
     */
    public markTokenAsUsed(token: string): void {
        const data = this.resetData.get(token);
        if (data) {
            data.isUsed = true;
        }
    }

    /**
     * Kullanıcının şifresini günceller
     */
    public async updatePassword(userId: string, newPassword: string): Promise<void> {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await this.userModel.findByIdAndUpdate(userId, {
            password: hashedPassword,
        });
    }

    /**
     * Şifre sıfırlama emaili gönderir
     */
    public async sendResetEmail(
        email: string,
        username: string,
        otpCode: string,
        token: string,
        frontendUrl: string = 'http://localhost:4200'
    ): Promise<boolean> {
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        const templateData = {
            name: username,
            otpCode,
            resetLink,
            subject: 'Şifre Sıfırlama - Gatekeeper',
        };

        try {
            return await this.emailService.sendMail(
                email,
                'password-reset',
                templateData,
                'Şifre Sıfırlama - Gatekeeper',
                {}
            );
        } catch (error) {
            console.error('Şifre sıfırlama emaili gönderim hatası:', error);
            return false;
        }
    }

    /**
     * Şifre sıfırlama başarı emaili gönderir
     */
    public async sendResetSuccessEmail(
        email: string,
        username: string,
        frontendUrl: string = 'http://localhost:4200'
    ): Promise<boolean> {
        const loginLink = `${frontendUrl}/login`;

        const templateData = {
            name: username,
            loginLink,
            subject: 'Şifreniz Başarıyla Güncellendi - Gatekeeper',
        };

        try {
            return await this.emailService.sendMail(
                email,
                'password-reset-success',
                templateData,
                'Şifreniz Başarıyla Güncellendi - Gatekeeper',
                {}
            );
        } catch (error) {
            console.error('Şifre sıfırlama başarı emaili gönderim hatası:', error);
            return false;
        }
    }

    /**
     * Süresi dolmuş tokenları temizler
     */
    public cleanupExpiredTokens(): void {
        const now = new Date();
        for (const [token, data] of this.resetData.entries()) {
            if (data.expiresAt < now) {
                this.resetData.delete(token);
            }
        }
    }
}
