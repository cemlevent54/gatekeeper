import { Test, TestingModule } from '@nestjs/testing';
import { TokenBlacklistService } from './token-blacklist.service';

describe('TokenBlacklistService', () => {
    let service: TokenBlacklistService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TokenBlacklistService],
        }).compile();

        service = module.get<TokenBlacklistService>(TokenBlacklistService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('blacklistToken', () => {
        it('should add token to blacklist', () => {
            const token = 'test-token-123';

            service.blacklistToken(token);

            expect(service.isTokenBlacklisted(token)).toBe(true);
        });

        it('should handle multiple tokens', () => {
            const token1 = 'test-token-1';
            const token2 = 'test-token-2';

            service.blacklistToken(token1);
            service.blacklistToken(token2);

            expect(service.isTokenBlacklisted(token1)).toBe(true);
            expect(service.isTokenBlacklisted(token2)).toBe(true);
        });
    });

    describe('isTokenBlacklisted', () => {
        it('should return false for non-blacklisted token', () => {
            const token = 'non-blacklisted-token';

            expect(service.isTokenBlacklisted(token)).toBe(false);
        });

        it('should return true for blacklisted token', () => {
            const token = 'blacklisted-token';

            service.blacklistToken(token);

            expect(service.isTokenBlacklisted(token)).toBe(true);
        });
    });

    describe('removeFromBlacklist', () => {
        it('should remove token from blacklist', () => {
            const token = 'removable-token';

            service.blacklistToken(token);
            expect(service.isTokenBlacklisted(token)).toBe(true);

            service.removeFromBlacklist(token);
            expect(service.isTokenBlacklisted(token)).toBe(false);
        });

        it('should handle removing non-existent token gracefully', () => {
            const token = 'non-existent-token';

            expect(() => service.removeFromBlacklist(token)).not.toThrow();
            expect(service.isTokenBlacklisted(token)).toBe(false);
        });
    });

    describe('clearBlacklist', () => {
        it('should clear all blacklisted tokens', () => {
            const token1 = 'token-1';
            const token2 = 'token-2';

            service.blacklistToken(token1);
            service.blacklistToken(token2);

            expect(service.getBlacklistSize()).toBe(2);

            service.clearBlacklist();

            expect(service.getBlacklistSize()).toBe(0);
            expect(service.isTokenBlacklisted(token1)).toBe(false);
            expect(service.isTokenBlacklisted(token2)).toBe(false);
        });
    });

    describe('getBlacklistSize', () => {
        it('should return 0 for empty blacklist', () => {
            expect(service.getBlacklistSize()).toBe(0);
        });

        it('should return correct size after adding tokens', () => {
            service.blacklistToken('token-1');
            expect(service.getBlacklistSize()).toBe(1);

            service.blacklistToken('token-2');
            expect(service.getBlacklistSize()).toBe(2);

            service.blacklistToken('token-3');
            expect(service.getBlacklistSize()).toBe(3);
        });

        it('should return correct size after removing tokens', () => {
            service.blacklistToken('token-1');
            service.blacklistToken('token-2');
            service.blacklistToken('token-3');

            expect(service.getBlacklistSize()).toBe(3);

            service.removeFromBlacklist('token-2');
            expect(service.getBlacklistSize()).toBe(2);

            service.removeFromBlacklist('token-1');
            expect(service.getBlacklistSize()).toBe(1);
        });
    });
});
