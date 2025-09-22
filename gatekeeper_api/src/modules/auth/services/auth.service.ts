import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { LogoutDto } from '../dto/logout.dto';
import { JwtService } from './jwt/jwt.service';
import { EmailVerificationService } from './email-verification.service';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { PasswordResetService } from './password-reset.service';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly roleRepository: RoleRepository,
        private readonly jwtService: JwtService,
        private readonly emailVerificationService: EmailVerificationService,
        private readonly passwordResetService: PasswordResetService,
        private readonly tokenBlacklistService: TokenBlacklistService,
    ) { }

    async register(dto: RegisterDto): Promise<{ user: any; reactivated: boolean } | null> {
        if (!dto || !dto.username || !dto.email || !dto.password) {
            return null;
        }

        // 1) Kullanıcı mevcut mu? (email veya username)
        const existing = await this.userRepository.findByEmailOrUsername(
            dto.email.toLowerCase().trim(),
            dto.username.trim(),
        );
        if (existing) {
            // Soft deleted ise reaktivasyon yap
            if (existing.isDeleted === true) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(dto.password, saltRounds);
                existing.isDeleted = false;
                (existing as any).password = hashedPassword;
                (existing as any).username = dto.username.trim();
                (existing as any).email = dto.email.toLowerCase().trim();

                // Eğer daha önce doğrulanmamışsa email doğrulama gönder
                if (!existing.verifiedAt) {
                    const { otpCode, token } = this.emailVerificationService.createVerificationData(String(existing._id));
                    const emailSent = await this.emailVerificationService.sendVerificationEmail(
                        dto.email.toLowerCase().trim(),
                        dto.username.trim(),
                        otpCode,
                        token
                    );
                    if (!emailSent) {
                        console.warn(`[AuthService] Reaktivasyon email gönderilemedi: ${dto.email}`);
                    }
                }

                await this.userRepository.save(existing as any);
                const user = await this.userRepository.findByIdLeanWithoutPassword(String(existing._id));
                return { user, reactivated: true };
            }
            // Aktif ve silinmemiş kullanıcı -> çakışma
            throw new ConflictException('Username or email already in use');
        }

        // 2) Rolü bul (yoksa NotFound)
        const defaultRoleName = 'user'; // istenirse .env veya sabit
        const role = await this.roleRepository.findByNameLean(defaultRoleName);
        if (!role) {
            throw new NotFoundException(`Default role '${defaultRoleName}' not found`);
        }

        // 3) Şifreyi hashle
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

        // 4) Kullanıcı oluştur
        const created = await this.userRepository.create({
            username: dto.username.trim(),
            email: dto.email.toLowerCase().trim(),
            password: hashedPassword,
            role: role._id,
            verifiedAt: null,
        });

        // Email doğrulama için OTP ve token oluştur
        const { otpCode, token } = this.emailVerificationService.createVerificationData(String(created._id));

        // Doğrulama emaili gönder
        const emailSent = await this.emailVerificationService.sendVerificationEmail(
            created.email,
            created.username,
            otpCode,
            token
        );

        if (!emailSent) {
            console.warn(`[AuthService] Email gönderilemedi: ${created.email}`);
        }

        // Parola olmadan geri döndür
        const user = await this.userRepository.findByIdLeanWithoutPassword(String((created as any)._id));

        return { user, reactivated: false };
    }

    async login(dto: LoginDto): Promise<any> {
        const identifier = dto.usernameOrEmail?.trim().toLowerCase();
        if (!identifier || !dto.password) {
            return null;
        }

        // Kullanıcıyı username veya email ile bul
        const user = await this.userRepository.findOneSelectPassword({
            $or: [
                { email: identifier },
                { username: dto.usernameOrEmail?.trim() },
            ],
        });
        if (!user) {
            return null; // unauthorized
        }

        // Soft deleted ise girişe izin verme
        if (user.isDeleted === true) {
            throw new ForbiddenException('User account is deleted');
        }

        // verifiedAt boşsa girişe izin verme
        if (!user.verifiedAt) {
            throw new ForbiddenException('User email is not verified');
        }

        // Parola kontrolü
        const ok = await bcrypt.compare(dto.password, (user as any).password);
        if (!ok) {
            return null; // unauthorized
        }

        // Başarılı giriş - lastLoginAt güncelle
        await this.userRepository.findByIdAndUpdate(String(user._id), {
            lastLoginAt: new Date()
        });

        // Başarılı - parola hariç kullanıcıyı döndür
        const safe = await this.userRepository.findByIdPopulateRoleLeanWithoutPassword(String(user._id));
        const tokenPair = this.jwtService.generateTokenPair({
            sub: String(user._id),
            username: (user as any).username,
            email: (user as any).email,
            role: String((user as any).role),
        });
        return { user: safe, tokens: tokenPair };
    }

    async verifyEmail(dto: VerifyEmailDto): Promise<{ success: boolean; message: string; data?: any }> {
        const verification = this.emailVerificationService.verifyEmailData(dto.token, dto.otpCode);
        if (!verification.isValid || !verification.userId) {
            return { success: false, message: verification.error || 'Doğrulama başarısız' };
        }

        await this.emailVerificationService.markEmailAsVerified(verification.userId);
        this.emailVerificationService.markTokenAsUsed(dto.token);

        const user = await this.userRepository.findByIdLeanWithoutPassword(verification.userId);
        return { success: true, message: 'Email doğrulandı', data: { user } };
    }

    async forgotPassword(dto: ForgotPasswordDto): Promise<{ success: boolean; message: string }> {
        const email = dto.email?.trim().toLowerCase();
        if (!email) return { success: false, message: 'Email gerekli' };

        const user = await this.userRepository.findByEmailOrUsername(email, '');
        if (!user) return { success: true, message: 'Eğer kayıtlı ise mail gönderildi' };

        const { otpCode, token } = this.passwordResetService.createResetData(String(user._id));
        const sent = await this.passwordResetService.sendResetEmail((user as any).email, (user as any).username, otpCode, token);
        return { success: !!sent, message: sent ? 'Şifre sıfırlama maili gönderildi' : 'Mail gönderimi başarısız' };
    }

    async resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean; message: string; data?: any }> {
        const verification = this.passwordResetService.verifyResetData(dto.token, dto.otpCode);
        if (!verification.isValid || !verification.userId) {
            return { success: false, message: verification.error || 'Doğrulama başarısız' };
        }

        await this.passwordResetService.updatePassword(verification.userId, dto.password);
        this.passwordResetService.markTokenAsUsed(dto.token);

        // Opsiyonel: başarı maili
        try {
            const user = await this.userRepository.findByIdLeanWithoutPassword(verification.userId);
            if (user) {
                await this.passwordResetService.sendResetSuccessEmail((user as any).email, (user as any).username);
            }
        } catch { /* ignore */ }

        return { success: true, message: 'Şifre güncellendi' };
    }

    async logout(dto: LogoutDto): Promise<{ success: boolean; message: string }> {
        if (dto.refreshToken) {
            this.tokenBlacklistService.blacklistToken(dto.refreshToken);
        }
        return { success: true, message: 'Çıkış yapıldı' };
    }
}
