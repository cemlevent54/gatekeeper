import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
    private blacklistedTokens = new Set<string>();

    /**
     * Token'ı blacklist'e ekler
     */
    public blacklistToken(token: string): void {
        this.blacklistedTokens.add(token);
    }

    /**
     * Token'ın blacklist'te olup olmadığını kontrol eder
     */
    public isTokenBlacklisted(token: string): boolean {
        return this.blacklistedTokens.has(token);
    }

    /**
     * Token'ı blacklist'ten çıkarır
     */
    public removeFromBlacklist(token: string): void {
        this.blacklistedTokens.delete(token);
    }

    /**
     * Tüm blacklist'i temizler
     */
    public clearBlacklist(): void {
        this.blacklistedTokens.clear();
    }

    /**
     * Blacklist'teki token sayısını döndürür
     */
    public getBlacklistSize(): number {
        return this.blacklistedTokens.size;
    }
}
