import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';
import { JwtService } from '../services/jwt/jwt.service';
import { TokenBlacklistService } from '../services/token-blacklist.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly tokenBlacklistService: TokenBlacklistService,
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        // Public route mu?
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Access token bulunamadı');
        }

        // Token blacklist'te mi kontrol et
        if (this.tokenBlacklistService.isTokenBlacklisted(token)) {
            throw new UnauthorizedException('Token geçersiz');
        }

        // Token'ı doğrula
        const payload = this.jwtService.verifyAccessToken(token);
        if (!payload) {
            throw new UnauthorizedException('Geçersiz access token');
        }

        // Request'e user bilgilerini ekle
        request.user = payload;
        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
