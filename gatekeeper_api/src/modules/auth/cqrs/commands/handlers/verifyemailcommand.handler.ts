import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyEmailCommand } from '../impl/verifyemailcommand.impl';
import { EmailVerificationService } from '../../../services/email-verification.service';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailCommandHandler implements ICommandHandler<VerifyEmailCommand> {
    constructor(
        private readonly emailVerificationService: EmailVerificationService,
    ) { }

    async execute(command: VerifyEmailCommand): Promise<{ success: boolean; message: string; data?: any }> {
        const { otpCode, token } = command;

        // Token ve OTP doğrulaması
        const verification = this.emailVerificationService.verifyEmailData(token, otpCode);

        if (!verification.isValid) {
            return {
                success: false,
                message: verification.error || 'Doğrulama başarısız',
            };
        }

        try {
            // Email'i doğrulanmış olarak işaretle
            await this.emailVerificationService.markEmailAsVerified(verification.userId!);

            // Token'ı kullanıldı olarak işaretle
            this.emailVerificationService.markTokenAsUsed(token);

            return {
                success: true,
                message: 'Email başarıyla doğrulandı',
                data: { verifiedAt: new Date() },
            };
        } catch (error) {
            return {
                success: false,
                message: 'Email doğrulama sırasında bir hata oluştu',
            };
        }
    }
}
