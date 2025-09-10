import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from '../impl/forgotpasswordcommand.impl';
import { PasswordResetService } from '../../../services/password-reset.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../../../schemas/user.schema';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordCommandHandler implements ICommandHandler<ForgotPasswordCommand> {
    constructor(
        private readonly passwordResetService: PasswordResetService,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async execute(command: ForgotPasswordCommand): Promise<{ success: boolean; message: string }> {
        const { email } = command;

        try {
            // Kullanıcıyı bul (email ile)
            const user = await this.userModel.findOne({
                email: email.toLowerCase().trim(),
                isDeleted: false
            }).lean();

            // Güvenlik için: kullanıcı bulunamasa bile başarı mesajı döndür
            if (!user) {
                return {
                    success: true,
                    message: 'Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir.',
                };
            }

            // Kullanıcı aktif değilse
            if (!user.isActive) {
                return {
                    success: true,
                    message: 'Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir.',
                };
            }

            // OTP ve token oluştur
            const { otpCode, token } = this.passwordResetService.createResetData(String(user._id));

            // Email gönder
            const emailSent = await this.passwordResetService.sendResetEmail(
                user.email,
                user.username,
                otpCode,
                token
            );

            if (!emailSent) {
                console.warn(`[ForgotPassword] Email gönderilemedi: ${user.email}`);
            }

            return {
                success: true,
                message: 'Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir.',
            };

        } catch (error) {
            console.error('[ForgotPassword] Hata:', error);
            return {
                success: true,
                message: 'Eğer bu email adresi sistemimizde kayıtlıysa, şifre sıfırlama linki gönderilmiştir.',
            };
        }
    }
}
