import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetService } from './password-reset.service';
import { getModelToken } from '@nestjs/mongoose';
import { EmailService } from '../../mail/email.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('PasswordResetService', () => {
    let service: PasswordResetService;

    const userModelMock: any = {
        findByIdAndUpdate: jest.fn(),
    };

    const emailServiceMock: any = {
        sendMail: jest.fn(),
    };

    beforeEach(async () => {
        jest.resetAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PasswordResetService,
                { provide: getModelToken('User'), useValue: userModelMock },
                { provide: EmailService, useValue: emailServiceMock },
            ],
        }).compile();

        service = module.get<PasswordResetService>(PasswordResetService);
    });

    describe('createResetData', () => {
        it('should create reset data with OTP and token', () => {
            const userId = 'user123';
            const result = service.createResetData(userId);

            expect(result).toHaveProperty('otpCode');
            expect(result).toHaveProperty('token');
            expect(result.otpCode).toMatch(/^\d{6}$/); // 6 haneli sayı
            expect(result.token).toBeTruthy();
        });

        it('should create different OTP codes for different calls', () => {
            const userId = 'user123';
            const result1 = service.createResetData(userId);
            const result2 = service.createResetData(userId);

            expect(result1.otpCode).not.toBe(result2.otpCode);
            expect(result1.token).not.toBe(result2.token);
        });
    });

    describe('verifyResetData', () => {
        it('should return invalid for non-existent token', () => {
            const result = service.verifyResetData('invalid-token', '123456');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Invalid or expired token');
        });

        it('should return invalid for wrong OTP code', () => {
            const userId = 'user123';
            const { token, otpCode } = service.createResetData(userId);

            const result = service.verifyResetData(token, 'wrong-otp');

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Invalid OTP code');
        });

        it('should return valid for correct token and OTP', () => {
            const userId = 'user123';
            const { token, otpCode } = service.createResetData(userId);

            const result = service.verifyResetData(token, otpCode);

            expect(result.isValid).toBe(true);
            expect(result.userId).toBe(userId);
        });

        it('should return invalid for already used token', () => {
            const userId = 'user123';
            const { token, otpCode } = service.createResetData(userId);

            // İlk doğrulama
            service.verifyResetData(token, otpCode);
            service.markTokenAsUsed(token);

            // İkinci doğrulama
            const result = service.verifyResetData(token, otpCode);

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Token already used');
        });
    });

    describe('updatePassword', () => {
        it('should hash and update user password', async () => {
            const userId = 'user123';
            const newPassword = 'newPassword123';
            const hashedPassword = 'hashedPassword123';

            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            const updateMock = jest.fn().mockResolvedValue({});
            userModelMock.findByIdAndUpdate.mockReturnValue({ exec: updateMock });

            await service.updatePassword(userId, newPassword);

            expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
            expect(userModelMock.findByIdAndUpdate).toHaveBeenCalledWith(userId, {
                password: hashedPassword,
            });
        });
    });

    describe('sendResetEmail', () => {
        it('should send reset email successfully', async () => {
            emailServiceMock.sendMail.mockResolvedValue(true);

            const result = await service.sendResetEmail(
                'test@example.com',
                'testuser',
                '123456',
                'token123'
            );

            expect(result).toBe(true);
            expect(emailServiceMock.sendMail).toHaveBeenCalledWith(
                'test@example.com',
                'password-reset',
                expect.objectContaining({
                    name: 'testuser',
                    otpCode: '123456',
                    resetLink: expect.stringContaining('token123'),
                }),
                'Şifre Sıfırlama - Gatekeeper',
                {}
            );
        });

        it('should return false when email sending fails', async () => {
            // Console.error'u mock'la
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            emailServiceMock.sendMail.mockRejectedValue(new Error('SMTP Error'));

            const result = await service.sendResetEmail(
                'test@example.com',
                'testuser',
                '123456',
                'token123'
            );

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Şifre sıfırlama emaili gönderim hatası:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('sendResetSuccessEmail', () => {
        it('should send reset success email successfully', async () => {
            emailServiceMock.sendMail.mockResolvedValue(true);

            const result = await service.sendResetSuccessEmail(
                'test@example.com',
                'testuser'
            );

            expect(result).toBe(true);
            expect(emailServiceMock.sendMail).toHaveBeenCalledWith(
                'test@example.com',
                'password-reset-success',
                expect.objectContaining({
                    name: 'testuser',
                    loginLink: expect.stringContaining('/login'),
                }),
                'Şifreniz Başarıyla Güncellendi - Gatekeeper',
                {}
            );
        });

        it('should return false when email sending fails', async () => {
            // Console.error'u mock'la
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            emailServiceMock.sendMail.mockRejectedValue(new Error('SMTP Error'));

            const result = await service.sendResetSuccessEmail(
                'test@example.com',
                'testuser'
            );

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Şifre sıfırlama başarı emaili gönderim hatası:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('cleanupExpiredTokens', () => {
        it('should remove expired tokens', () => {
            const userId = 'user123';
            const { token } = service.createResetData(userId);

            // Token'ı manuel olarak expire et (test için)
            const resetData = (service as any).resetData.get(token);
            resetData.expiresAt = new Date(Date.now() - 1000); // 1 saniye önce

            service.cleanupExpiredTokens();

            const result = service.verifyResetData(token, '123456');
            expect(result.isValid).toBe(false);
        });
    });
});
