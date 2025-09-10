import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from '../impl/resetpasswordcommand.impl';
import { PasswordResetService } from '../../../services/password-reset.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../../../schemas/user.schema';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordCommandHandler implements ICommandHandler<ResetPasswordCommand> {
    constructor(
        private readonly passwordResetService: PasswordResetService,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async execute(command: ResetPasswordCommand): Promise<{ success: boolean; message: string; data?: any }> {
        const { otpCode, token, password } = command;

        try {
            // Token ve OTP doğrulaması
            const verification = this.passwordResetService.verifyResetData(token, otpCode);

            if (!verification.isValid) {
                return {
                    success: false,
                    message: 'Geçersiz veya süresi dolmuş doğrulama bilgileri',
                };
            }

            // Kullanıcıyı bul
            const user = await this.userModel.findById(verification.userId).lean();
            if (!user) {
                return {
                    success: false,
                    message: 'Kullanıcı bulunamadı',
                };
            }

            // Kullanıcı aktif değilse
            if (!user.isActive) {
                return {
                    success: false,
                    message: 'Hesap aktif değil',
                };
            }

            // Şifreyi güncelle
            await this.passwordResetService.updatePassword(verification.userId!, password);

            // Token'ı kullanıldı olarak işaretle
            this.passwordResetService.markTokenAsUsed(token);

            // Başarı emaili gönder
            const emailSent = await this.passwordResetService.sendResetSuccessEmail(
                user.email,
                user.username
            );

            if (!emailSent) {
                console.warn(`[ResetPassword] Başarı emaili gönderilemedi: ${user.email}`);
            }

            return {
                success: true,
                message: 'Şifreniz başarıyla güncellendi',
                data: { updatedAt: new Date() },
            };

        } catch (error) {
            console.error('[ResetPassword] Hata:', error);
            return {
                success: false,
                message: 'Şifre güncelleme sırasında bir hata oluştu',
            };
        }
    }
}
