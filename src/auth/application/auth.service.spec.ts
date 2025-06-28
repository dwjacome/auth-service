import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AUTH_REPOSITORY } from '../domain/ports/auth.port.repository';
import { IAuth, ILogin, IToken } from '../domain/interfaces';
import { MessagesConstant } from '../../common/constants';
import { ResponsesUtil } from '../../common/utils';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockAuthRepository: any;
  let mockJwtService: any;
  let mockConfigService: any;
  let mockBcrypt: any;

  const mockAuth: IAuth = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedPassword',
    status: 'active',
    created_at: 1234567890,
    updated_at: 1234567890,
  };

  beforeEach(async () => {
    mockAuthRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findByRefresh: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
      decode: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(),
    };

    mockBcrypt = require('bcryptjs');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AUTH_REPOSITORY,
          useValue: mockAuthRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createAuthDto = {
      email: 'new@example.com',
      username: 'newuser',
      password: 'password123',
    };

    it('should create auth successfully', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedPassword');
      mockAuthRepository.create.mockResolvedValue({ id: '1', password: 'hashedPassword' });

      const result = await service.create(createAuthDto);

      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(createAuthDto.email);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(createAuthDto.password, 10);
      expect(mockAuthRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: createAuthDto.email,
        username: createAuthDto.username,
        password: 'hashedPassword',
      }));
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.user.create, [{ id: '1', password: 'hashedPassword' }]));
    });

    it('should create auth with username when email is not provided', async () => {
      const createWithUsernameDto = { username: 'newuser', password: 'password123' };
      mockAuthRepository.findByUsername.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedPassword');
      mockAuthRepository.create.mockResolvedValue({ id: '1', password: 'hashedPassword' });

      await service.create(createWithUsernameDto);

      expect(mockAuthRepository.findByUsername).toHaveBeenCalledWith(createWithUsernameDto.username);
    });

    it('should throw BadRequestException if auth with email already exists', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockAuth);

      await expect(service.create(createAuthDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if auth with username already exists', async () => {
      const createWithUsernameDto = { username: 'existinguser', password: 'password123' };
      mockAuthRepository.findByUsername.mockResolvedValue(mockAuth);

      await expect(service.create(createWithUsernameDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should find auth successfully', async () => {
      mockAuthRepository.findOne.mockResolvedValue(mockAuth);

      const result = await service.findOne('1');

      expect(mockAuthRepository.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.user.find, [expect.any(Object)]));
      expect((result as any).data[0].password).toBeUndefined();
    });

    it('should throw UnauthorizedException when auth not found', async () => {
      mockAuthRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    const updateDto = {
      email: 'updated@example.com',
      username: 'updateduser',
    };

    it('should update auth successfully', async () => {
      mockAuthRepository.findOne.mockResolvedValue(mockAuth);
      mockAuthRepository.findByEmail.mockResolvedValue(null);
      mockAuthRepository.findByUsername.mockResolvedValue(null);
      mockAuthRepository.update.mockResolvedValue({ ...mockAuth, ...updateDto });

      const result = await service.update('1', updateDto);

      expect(mockAuthRepository.findOne).toHaveBeenCalledWith('1');
      expect(mockAuthRepository.update).toHaveBeenCalled();
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.user.update));
    });

    it('should throw UnauthorizedException when auth not found', async () => {
      mockAuthRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when email already exists', async () => {
      mockAuthRepository.findOne.mockResolvedValue(mockAuth);
      mockAuthRepository.findByEmail.mockResolvedValue({ id: '2' });

      await expect(service.update('1', { email: 'existing@example.com' })).rejects.toThrow(BadRequestException);
    });

    it('should handle password update correctly', async () => {
      mockAuthRepository.findOne.mockResolvedValue(mockAuth);
      mockAuthRepository.findByEmail.mockResolvedValue(null);
      mockAuthRepository.findByUsername.mockResolvedValue(null);
      mockAuthRepository.update.mockResolvedValue(mockAuth);
      mockBcrypt.hash.mockResolvedValue('newHashedPassword');

      await service.update('1', { password: 'newPassword' });

      expect(mockBcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    });
  });

  describe('delete', () => {
    it('should delete auth successfully', async () => {
      mockAuthRepository.findOne.mockResolvedValue(mockAuth);
      mockAuthRepository.update.mockResolvedValue({ ...mockAuth, status: 'deleted' });

      const result = await service.delete('1');

      expect(mockAuthRepository.findOne).toHaveBeenCalledWith('1');
      expect(mockAuthRepository.update).toHaveBeenCalledWith('1', expect.objectContaining({
        status: 'deleted',
      }));
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.user.delete));
    });

    it('should throw UnauthorizedException when auth not found', async () => {
      mockAuthRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('1')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('createToken', () => {
    const refreshToken: IToken = {
      token: 'refresh-token',
    };

    it('should create new token successfully', async () => {
      mockAuthRepository.findByRefresh.mockResolvedValue(mockAuth);
      mockJwtService.decode.mockReturnValue({ sub: '1', roles: ['client'] });
      mockConfigService.get.mockReturnValue('1h');
      mockJwtService.sign.mockReturnValue('new-access-token');

      const result = await service.createToken(refreshToken);

      expect(mockAuthRepository.findByRefresh).toHaveBeenCalledWith(refreshToken);
      expect(mockJwtService.decode).toHaveBeenCalledWith(refreshToken.token);
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.auth.token, [{ token: 'new-access-token' }]));
    });

    it('should throw UnauthorizedException when refresh token not found', async () => {
      mockAuthRepository.findByRefresh.mockResolvedValue(null);

      await expect(service.createToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockAuthRepository.findByRefresh.mockResolvedValue(mockAuth);
      mockJwtService.decode.mockReturnValue(null);

      await expect(service.createToken(refreshToken)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    const loginDto: ILogin = {
      user: 'test@example.com',
      password: 'password123',
      payload: { roles: ['client'] },
    };

    it('should login successfully with email', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockAuth);
      mockBcrypt.compare.mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('refresh-token')
        .mockReturnValueOnce('access-token');
      mockAuthRepository.update.mockResolvedValue(mockAuth);

      const result = await service.login(loginDto);

      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(loginDto.user);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockAuth.password);
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockAuthRepository.update).toHaveBeenCalled();
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.auth.success, [expect.any(Object)]));
    });

    it('should login successfully with username', async () => {
      const usernameLoginDto = { ...loginDto, user: 'testuser' };
      mockAuthRepository.findByUsername.mockResolvedValue(mockAuth);
      mockBcrypt.compare.mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('refresh-token')
        .mockReturnValueOnce('access-token');
      mockAuthRepository.update.mockResolvedValue(mockAuth);

      const result = await service.login(usernameLoginDto);

      expect(mockAuthRepository.findByUsername).toHaveBeenCalledWith(usernameLoginDto.user);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockAuth);
      mockBcrypt.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when auth not found', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
}); 