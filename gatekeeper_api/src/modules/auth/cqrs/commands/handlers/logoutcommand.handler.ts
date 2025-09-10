import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from '../impl/logoutcommand.impl';
import { JwtService } from '../../../services/jwt/jwt.service';
import { TokenBlacklistService } from '../../../services/token-blacklist.service';

@CommandHandler(LogoutCommand)
export class LogoutCommandHandler implements ICommandHandler<LogoutCommand> {
    constructor(
        private readonly jwtService: JwtService,
        private readonly tokenBlacklistService: TokenBlacklistService,
    ) { }

    async execute(command: LogoutCommand): Promise<{ success: boolean; message: string }> {
        const { refreshToken } = command;

        try {
            // Refresh token'ı doğrula
            const decoded = this.jwtService.verifyRefreshToken(refreshToken);

            if (!decoded) {
                return {
                    success: false,
                    message: 'Geçersiz refresh token',
                };
            }

            // Refresh token'ı blacklist'e ekle
            this.tokenBlacklistService.blacklistToken(refreshToken);

            return {
                success: true,
                message: 'Başarıyla çıkış yapıldı',
            };

        } catch (error) {
            console.error('[Logout] Hata:', error);
            return {
                success: false,
                message: 'Çıkış işlemi sırasında bir hata oluştu',
            };
        }
    }
}
