import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtService } from './jwt/jwt.service';
import { EmailVerificationService } from './email-verification.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const userModelMock: any = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const roleModelMock: any = {
    findOne: jest.fn(),
  };

  const jwtServiceMock: any = {
    generateTokenPair: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const emailVerificationServiceMock: any = {
    createVerificationData: jest.fn().mockReturnValue({
      otpCode: '123456',
      token: 'verification-token',
    }),
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    // Mock'ları yeniden tanımla
    emailVerificationServiceMock.createVerificationData.mockReturnValue({
      otpCode: '123456',
      token: 'verification-token',
    });
    emailVerificationServiceMock.sendVerificationEmail.mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: userModelMock },
        { provide: getModelToken('Role'), useValue: roleModelMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: EmailVerificationService, useValue: emailVerificationServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    const dto = { username: 'john', email: 'john@example.com', password: 'Secret123' };

    it('should throw ConflictException when active user exists', async () => {
      userModelMock.findOne.mockResolvedValue({ isActive: true, isDeleted: false });
      await expect(service.register(dto as any)).rejects.toBeInstanceOf(ConflictException);
    });

    it('should throw ForbiddenException when user is blocked (isActive=false)', async () => {
      userModelMock.findOne.mockResolvedValue({ isActive: false, isDeleted: false });
      await expect(service.register(dto as any)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should reactivate soft-deleted user (not blocked)', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const save = jest.fn().mockResolvedValue(undefined);
      const existingDoc: any = { _id: 'u1', isActive: true, isDeleted: true, save };
      userModelMock.findOne.mockResolvedValue(existingDoc);
      userModelMock.findById.mockReturnValue({
        select: () => ({ lean: () => Promise.resolve({ _id: 'u1', username: 'john', email: 'john@example.com', isActive: true, isDeleted: false }) }),
      });

      const result = await service.register(dto as any);
      expect(result?.reactivated).toBe(true);
      expect(result?.user).toMatchObject({ _id: 'u1', username: 'john' });
      expect(save).toHaveBeenCalled();
    });

    it('should create new user when not exists', async () => {
      userModelMock.findOne.mockResolvedValue(null);
      roleModelMock.findOne.mockReturnValue({ lean: () => Promise.resolve({ _id: 'role-user' }) });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const createdPayloads: any[] = [];
      userModelMock.create.mockImplementation(async (payload: any) => {
        createdPayloads.push(payload);
        return { _id: 'u2' };
      });
      userModelMock.findById.mockReturnValue({
        select: () => ({ lean: () => Promise.resolve({ _id: 'u2', username: 'john', email: 'john@example.com' }) }),
      });

      const result = await service.register(dto as any);
      expect(result?.reactivated).toBe(false);
      expect(result?.user).toMatchObject({ _id: 'u2', username: 'john' });
      // verifiedAt null olarak set edilmeli
      expect(createdPayloads[0].verifiedAt).toBeNull();
    });

    it('should throw NotFoundException when default role is missing', async () => {
      userModelMock.findOne.mockResolvedValue(null);
      roleModelMock.findOne.mockReturnValue({ lean: () => Promise.resolve(null) });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      await expect(service.register(dto as any)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('login', () => {
    const dto = { usernameOrEmail: 'john@example.com', password: 'Secret123' };

    it('should return null when user not found', async () => {
      userModelMock.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
      const result = await service.login(dto as any);
      expect(result).toBeNull();
    });

    it('should throw ForbiddenException when user is blocked (isActive=false)', async () => {
      userModelMock.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue({ isActive: false }) });
      await expect(service.login(dto as any)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should throw ForbiddenException when user email not verified (verifiedAt null)', async () => {
      userModelMock.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue({ isActive: true, verifiedAt: null }) });
      await expect(service.login(dto as any)).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should reactivate soft-deleted user on login', async () => {
      const save = jest.fn().mockResolvedValue(undefined);
      const found: any = { _id: 'u3', isActive: true, isDeleted: true, verifiedAt: new Date(), password: 'hashed', save };
      userModelMock.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(found) });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userModelMock.findById.mockReturnValue({
        select: () => ({ lean: () => Promise.resolve({ _id: 'u3', username: 'john' }) }),
      });
      jwtServiceMock.generateTokenPair.mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        accessTokenExpiresAt: 1234567890,
        refreshTokenExpiresAt: 1234567890,
      });

      const result = await service.login(dto as any);
      expect(result).toMatchObject({
        user: { _id: 'u3', username: 'john' },
        tokens: expect.any(Object)
      });
      expect(save).toHaveBeenCalled();
    });

    it('should return null for wrong password', async () => {
      const found: any = { _id: 'u4', isActive: true, isDeleted: false, verifiedAt: new Date(), password: 'hashed' };
      userModelMock.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(found) });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.login(dto as any);
      expect(result).toBeNull();
    });

    it('should return user on successful login', async () => {
      const found: any = { _id: 'u5', isActive: true, isDeleted: false, verifiedAt: new Date(), password: 'hashed' };
      userModelMock.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(found) });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userModelMock.findById.mockReturnValue({
        select: () => ({ lean: () => Promise.resolve({ _id: 'u5', username: 'john' }) }),
      });
      jwtServiceMock.generateTokenPair.mockReturnValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        accessTokenExpiresAt: 1234567890,
        refreshTokenExpiresAt: 1234567890,
      });

      const result = await service.login(dto as any);
      expect(result).toMatchObject({
        user: { _id: 'u5', username: 'john' },
        tokens: expect.any(Object)
      });
    });
  });
});

