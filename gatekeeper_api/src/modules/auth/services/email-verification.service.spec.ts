import { Test, TestingModule } from '@nestjs/testing';
import { EmailVerificationService } from './email-verification.service';
import { getModelToken } from '@nestjs/mongoose';
import { EmailService } from '../../mail/email.service';
import { JwtService } from './jwt/jwt.service';

describe('EmailVerificationService', () => {
    let service: EmailVerificationService;

    const userModelMock: any = {
        findByIdAndUpdate: jest.fn(),
    };

    const emailServiceMock: any = {
        sendMail: jest.fn(),
    };

    const jwtServiceMock: any = {
        generateTokenPair: jest.fn(),
        verifyAccessToken: jest.fn(),
        verifyRefreshToken: jest.fn(),
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailVerificationService,
                { provide: getModelToken('User'), useValue: userModelMock },
                { provide: EmailService, useValue: emailServiceMock },
                { provide: JwtService, useValue: jwtServiceMock },
            ],
        }).compile();

        service = module.get<EmailVerificationService>(EmailVerificationService);
    });

    describe('createVerificationData', () => {
        it('should create verification data with OTP and token', () => {
            const userId = 'user123';
            const result = service.createVerificationData(userId);

            expect(result).toHaveProperty('otpCode');
            expect(result).toHaveProperty('token');
            expect(result.otpCode).toMatch(/^\d{6}$/); // 6 haneli sayı
            expect(result.token).toBeTruthy();
        });

        it('should create different OTP codes for different calls', () => {
            const userId = 'user123';
            const result1 = service.createVerificationData(userId);
            const result2 = service.createVerificationData(userId);

            expect(result1.otpCode).not.toBe(result2.otpCode);
            expect(result1.token).not.toBe(result2.token);
        });
    });

    describe('verifyEmailData', () => {
        it('should return invalid for non-existent token', () => {
            const result = service.verifyEmailData('invalid-token', '123456');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Invalid or expired token');
        });

        it('should return invalid for wrong OTP code', () => {
            const userId = 'user123';
            const { token, otpCode } = service.createVerificationData(userId);

            const result = service.verifyEmailData(token, 'wrong-otp');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Invalid OTP code');
        });

        it('should return valid for correct token and OTP', () => {
            const userId = 'user123';
            const { token, otpCode } = service.createVerificationData(userId);

            const result = service.verifyEmailData(token, otpCode);

            expect(result.isValid).toBe(true);
            expect(result.userId).toBe(userId);
        });

        it('should return invalid for already used token', () => {
            const userId = 'user123';
            const { token, otpCode } = service.createVerificationData(userId);

            // İlk doğrulama
            service.verifyEmailData(token, otpCode);
            service.markTokenAsUsed(token);

            // İkinci doğrulama
            const result = service.verifyEmailData(token, otpCode);

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Token already used');
        });
    });

    describe('markEmailAsVerified', () => {
        it('should update user verifiedAt field', async () => {
            const userId = 'user123';
            const updateMock = jest.fn().mockResolvedValue({});
            userModelMock.findByIdAndUpdate.mockReturnValue({ exec: updateMock });

            await service.markEmailAsVerified(userId);

            expect(userModelMock.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
                verifiedAt: expect.any(Date),
            });
        });
    });

    describe('sendVerificationEmail', () => {
        it('should send verification email successfully', async () => {
            emailServiceMock.sendMail.mockResolvedValue(true);

            const result = await service.sendVerificationEmail(
                'test@example.com',
                'testuser',
                '123456',
                'token123'
            );

            expect(result).toBe(true);
            expect(emailServiceMock.sendMail).toHaveBeenCalledWith(
                'test@example.com',
                'email-verification',
                expect.objectContaining({
                    name: 'testuser',
                    otpCode: '123456',
                    verificationLink: expect.stringContaining('token123'),
                }),
                'Email Doğrulama - Gatekeeper',
                {}
            );
        });

        it('should return false when email sending fails', async () => {
            // Console.error'u mock'la
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            emailServiceMock.sendMail.mockRejectedValue(new Error('SMTP Error'));

            const result = await service.sendVerificationEmail(
                'test@example.com',
                'testuser',
                '123456',
                'token123'
            );

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Email gönderim hatası:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('cleanupExpiredTokens', () => {
        it('should remove expired tokens', () => {
            const userId = 'user123';
            const { token } = service.createVerificationData(userId);

            // Token'ı manuel olarak expire et (test için)
            const verificationData = (service as any).verificationData.get(token);
            verificationData.expiresAt = new Date(Date.now() - 1000); // 1 saniye önce

            service.cleanupExpiredTokens();

            const result = service.verifyEmailData(token, '123456');
            expect(result.isValid).toBe(false);
        });
    });
});
