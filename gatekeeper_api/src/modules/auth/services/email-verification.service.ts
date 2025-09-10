import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../schemas/user.schema';
import { EmailService } from '../../mail/email.service';
import { JwtService } from './jwt/jwt.service';
import * as jwt from 'jsonwebtoken';

export interface EmailVerificationData {
    userId: string;
    otpCode: string;
    token: string;
    expiresAt: Date;
    isUsed: boolean;
}

@Injectable()
export class EmailVerificationService {
    private verificationData = new Map<string, EmailVerificationData>();

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * 6 haneli OTP kodu üretir
     */
    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Email doğrulama için JWT token üretir
     */
    private generateVerificationToken(userId: string, otpCode: string): string {
        const payload = {
            sub: userId,
            otpCode: otpCode,
            type: 'email_verification',
            iat: Math.floor(Date.now() / 1000),
        };

        // Email doğrulama için özel secret kullan
        const secret = process.env.JWT_EMAIL_VERIFICATION_SECRET || 'email-verification-secret';
        const expiresIn = '15m'; // 15 dakika

        return jwt.sign(payload, secret, { expiresIn });
    }

    /**
     * Email doğrulama verilerini oluşturur ve saklar
     */
    public createVerificationData(userId: string): { otpCode: string; token: string } {
        const otpCode = this.generateOTP();
        const token = this.generateVerificationToken(userId, otpCode);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

        this.verificationData.set(token, {
            userId,
            otpCode,
            token,
            expiresAt,
            isUsed: false,
        });

        return { otpCode, token };
    }

    /**
     * Email doğrulama verilerini doğrular
     */
    public verifyEmailData(token: string, otpCode: string): { isValid: boolean; userId?: string; error?: string } {
        try {
            // JWT token'ı doğrula
            const secret = process.env.JWT_EMAIL_VERIFICATION_SECRET || 'email-verification-secret';
            const decoded = jwt.verify(token, secret) as any;

            // Token tipini kontrol et
            if (decoded.type !== 'email_verification') {
                return { isValid: false, error: 'Invalid token type' };
            }

            // OTP kodunu kontrol et
            if (decoded.otpCode !== otpCode) {
                return { isValid: false, error: 'Invalid OTP code' };
            }

            // Memory'deki kullanım durumunu kontrol et
            const data = this.verificationData.get(token);
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
        const data = this.verificationData.get(token);
        if (data) {
            data.isUsed = true;
        }
    }

    /**
     * Kullanıcının email adresini doğrulanmış olarak işaretler
     */
    public async markEmailAsVerified(userId: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, {
            verifiedAt: new Date(),
        });
    }

    /**
     * Doğrulama emaili gönderir
     */
    public async sendVerificationEmail(
        email: string,
        username: string,
        otpCode: string,
        token: string,
        frontendUrl: string = 'http://localhost:4200'
    ): Promise<boolean> {
        const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

        const templateData = {
            name: username,
            otpCode,
            verificationLink,
            subject: 'Email Doğrulama - Gatekeeper',
        };

        try {
            return await this.emailService.sendMail(
                email,
                'email-verification',
                templateData,
                'Email Doğrulama - Gatekeeper',
                {}
            );
        } catch (error) {
            console.error('Email gönderim hatası:', error);
            return false;
        }
    }

    /**
     * Süresi dolmuş tokenları temizler
     */
    public cleanupExpiredTokens(): void {
        const now = new Date();
        for (const [token, data] of this.verificationData.entries()) {
            if (data.expiresAt < now) {
                this.verificationData.delete(token);
            }
        }
    }
}
