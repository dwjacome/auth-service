import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../../auth/application/auth.service';
import { USER_REPOSITORY } from '../domain/ports/user.port.repository';
import { IUser, ILogin } from '../domain/interfaces';
import { IValidRoles } from '../../common/interfaces/valid-roles.interface';
import { MessagesConstant } from '../../common/constants';
import { ResponsesUtil } from '../../common/utils';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: any;
  let mockAuthService: any;
  let mockBcrypt: any;

  const mockUser: IUser = {
    id: '1',
    id_auth: 'auth-1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    birth_date: 1234567890,
    roles: ['client'],
    status: 'active',
    created_at: 1234567890,
    updated_at: 1234567890,
  };

  const mockAuthResponse = {
    data: [{
      id: 'auth-1',
      password: 'hashedPassword',
    }],
  };

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockAuthService = {
      create: jest.fn(),
      login: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockBcrypt = require('bcryptjs');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      roles: ['client'],
    };

    it('should create a user successfully', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      // No se debe llamar a findByUsername si hay email
      mockAuthService.create.mockResolvedValue({
        data: [{
          id: 'auth-1',
          password: 'hashedPassword',
        }],
      });
      mockUserRepository.create.mockResolvedValue({ id: '1' });

      const result = await service.create(createUserDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(mockAuthService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.user.create, [{ id: '1' }]));
    });

    it('should throw BadRequestException if user with username already exists', async () => {
      // Simula que no hay email, pero sí username
      const dto = { ...createUserDto, email: undefined };
      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      // No se debe llamar a findByEmail si el email es undefined
      // expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(undefined);
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(dto.username);
      // No se debe llamar a create de auth ni de user
      expect(mockAuthService.create).not.toHaveBeenCalled();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should handle client role correctly', async () => {
      const clientUserDto = { ...createUserDto, roles: [IValidRoles.client] };
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockAuthService.create.mockResolvedValue({
        data: [{
          id: 'auth-1',
          password: 'hashedPassword',
        }],
      });
      mockUserRepository.create.mockResolvedValue({ id: '1' });

      await service.create(clientUserDto);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: ['client'],
        })
      );
    });

    it('should handle internal server error', async () => {
      mockUserRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login', () => {
    const loginDto: ILogin = {
      user: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with email', async () => {
      const mockUserWithPassword = { ...mockUser, password: 'hashedPassword' };
      mockUserRepository.findByEmail.mockResolvedValue(mockUserWithPassword);
      mockBcrypt.compare.mockResolvedValue(true);
      mockAuthService.login.mockResolvedValue({
        data: [{
          auth: { refresh_token: 'refresh-token' },
          token: 'access-token',
        }],
      });

      const result = await service.login(loginDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginDto.user);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(loginDto.password, 'hashedPassword');
      expect(mockAuthService.login).toHaveBeenCalledWith({
        user: mockUserWithPassword.email,
        password: loginDto.password,
        payload: { roles: mockUserWithPassword.roles }
      });
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.auth.success, [expect.any(Object)]));
    });

    it('should login successfully with username', async () => {
      const usernameLoginDto = { ...loginDto, user: 'testuser' };
      const mockUserWithPassword = { ...mockUser, password: 'hashedPassword' };
      mockUserRepository.findByUsername.mockResolvedValue(mockUserWithPassword);
      mockBcrypt.compare.mockResolvedValue(true);
      mockAuthService.login.mockResolvedValue({
        data: [{
          auth: { refresh_token: 'refresh-token' },
          token: 'access-token',
        }],
      });

      const result = await service.login(usernameLoginDto);

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(usernameLoginDto.user);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(usernameLoginDto.password, 'hashedPassword');
      expect(mockAuthService.login).toHaveBeenCalledWith({
        user: mockUserWithPassword.email,
        password: usernameLoginDto.password,
        payload: { roles: mockUserWithPassword.roles }
      });
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.auth.success, [expect.any(Object)]));
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findOne', () => {
    it('should find user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.user.find, [expect.any(Object)]));
      expect((result as any).data[0].password).toBeUndefined();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, ...updateDto });
      mockBcrypt.hash.mockResolvedValue('newHashedPassword');

      const result = await service.update('1', updateDto);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith('1');
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(mockAuthService.update).toHaveBeenCalledWith(mockUser.id_auth, updateDto);
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.user.update, [expect.any(Object)]));
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException when email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue({ id: '2' });

      await expect(service.update('1', { email: 'existing@example.com' })).rejects.toThrow(BadRequestException);
    });

    it('should handle password update correctly', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue('newHashedPassword');

      await service.update('1', { password: 'newPassword' });

      expect(mockBcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, status: 'deleted' });

      const result = await service.delete('1');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith('1');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', expect.objectContaining({
        status: 'deleted',
      }));
      expect(mockAuthService.delete).toHaveBeenCalledWith(mockUser.id_auth);
      expect(result).toEqual(ResponsesUtil.response(200, MessagesConstant.user.delete));
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('1')).rejects.toThrow(UnauthorizedException);
    });
  });
}); 