import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
    sub: string;
    username: string;
    email: string;
    role?: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number; // epoch seconds
    refreshTokenExpiresAt: number; // epoch seconds
}

@Injectable()
export class JwtService {
    constructor(private readonly configService: ConfigService) { }

    private getAccessSecret(): string {
        const s = this.configService.get<string>('JWT_ACCESS_SECRET');
        if (!s) throw new Error('JWT_ACCESS_SECRET is not set');
        return s;
    }

    private getRefreshSecret(): string {
        const s = this.configService.get<string>('JWT_REFRESH_SECRET');
        if (!s) throw new Error('JWT_REFRESH_SECRET is not set');
        return s;
    }

    private getAccessExpires(): string {
        return this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    }

    private getRefreshExpires(): string {
        return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';
    }

    public generateTokenPair(payload: JwtPayload): TokenPair {
        const accessExpiresIn = this.getAccessExpires();
        const refreshExpiresIn = this.getRefreshExpires();

        const nowSeconds = Math.floor(Date.now() / 1000);

        const accessToken = jwt.sign(payload, this.getAccessSecret(), {
            expiresIn: accessExpiresIn,
        });
        const refreshToken = jwt.sign({ sub: payload.sub }, this.getRefreshSecret(), {
            expiresIn: refreshExpiresIn,
        });

        // Decode to get exp values
        const accessDecoded = jwt.decode(accessToken) as any;
        const refreshDecoded = jwt.decode(refreshToken) as any;

        return {
            accessToken,
            refreshToken,
            accessTokenExpiresAt: accessDecoded?.exp || nowSeconds,
            refreshTokenExpiresAt: refreshDecoded?.exp || nowSeconds,
        };
    }

    public verifyAccessToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, this.getAccessSecret()) as JwtPayload;
        } catch {
            return null;
        }
    }

    public verifyRefreshToken(token: string): { sub: string } | null {
        try {
            return jwt.verify(token, this.getRefreshSecret()) as { sub: string };
        } catch {
            return null;
        }
    }

    public rotateRefreshToken(refreshToken: string, payloadForAccess: JwtPayload): TokenPair | null {
        const valid = this.verifyRefreshToken(refreshToken);
        if (!valid) return null;
        // Optionally ensure valid.sub === payloadForAccess.sub
        return this.generateTokenPair(payloadForAccess);
    }
}
