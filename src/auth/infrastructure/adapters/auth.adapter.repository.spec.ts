import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { AuthAdapterRepository } from './auth.adapter.repository';
import { DBService } from '../../../dababases/db.service';
import { IAuth, IToken } from '../../domain/interfaces';

describe('AuthAdapterRepository', () => {
  let repository: AuthAdapterRepository;
  let mockDBService: any;

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
    mockDBService = {
      create: jest.fn(),
      query: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthAdapterRepository,
        {
          provide: DBService,
          useValue: mockDBService,
        },
      ],
    }).compile();

    repository = module.get<AuthAdapterRepository>(AuthAdapterRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create auth successfully', async () => {
      mockDBService.create.mockResolvedValue(mockAuth);

      const result = await repository.create(mockAuth);

      expect(mockDBService.create).toHaveBeenCalledWith('auth', mockAuth);
      expect(result).toEqual(mockAuth);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockDBService.create.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(mockAuth)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should find auth by id successfully', async () => {
      mockDBService.query.mockResolvedValue([mockAuth]);

      const result = await repository.findOne('1');

      expect(mockDBService.query).toHaveBeenCalledWith('auth', {
        query: 'SELECT TOP 1 * FROM c WHERE c.id = @id AND c.status = @status',
        parameters: [{ name: '@id', value: '1' }, { name: '@status', value: 'active' }],
      });
      expect(result).toEqual(mockAuth);
    });

    it('should return null when auth not found', async () => {
      mockDBService.query.mockResolvedValue([]);

      const result = await repository.findOne('1');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should find auth by username successfully', async () => {
      mockDBService.query.mockResolvedValue([mockAuth]);

      const result = await repository.findByUsername('testuser');

      expect(mockDBService.query).toHaveBeenCalledWith('auth', {
        query: 'SELECT TOP 1 * FROM c WHERE c.username = @username AND c.status = @status',
        parameters: [{ name: '@username', value: 'testuser' }, { name: '@status', value: 'active' }],
      });
      expect(result).toEqual(mockAuth);
    });

    it('should return null when auth not found', async () => {
      mockDBService.query.mockResolvedValue([]);

      const result = await repository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find auth by email successfully', async () => {
      mockDBService.query.mockResolvedValue([mockAuth]);

      const result = await repository.findByEmail('test@example.com');

      expect(mockDBService.query).toHaveBeenCalledWith('auth', {
        query: 'SELECT TOP 1 * FROM c WHERE c.email = @email AND c.status = @status',
        parameters: [{ name: '@email', value: 'test@example.com' }, { name: '@status', value: 'active' }],
      });
      expect(result).toEqual(mockAuth);
    });

    it('should return null when auth not found', async () => {
      mockDBService.query.mockResolvedValue([]);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByRefresh', () => {
    it('should find auth by refresh token successfully', async () => {
      const refreshToken: IToken = { token: 'refresh-token' };
      mockDBService.query.mockResolvedValue([mockAuth]);

      const result = await repository.findByRefresh(refreshToken);

      expect(mockDBService.query).toHaveBeenCalledWith('auth', {
        query: 'SELECT TOP 1 * FROM c WHERE c.refresh_token = @refresh',
        parameters: [{ name: '@refresh', value: 'refresh-token' }],
      });
      expect(result).toEqual(mockAuth);
    });

    it('should return null when auth not found', async () => {
      const refreshToken: IToken = { token: 'invalid-token' };
      mockDBService.query.mockResolvedValue([]);

      const result = await repository.findByRefresh(refreshToken);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update auth successfully', async () => {
      const updatedAuth = { ...mockAuth, email: 'updated@example.com' };
      mockDBService.update.mockResolvedValue(undefined);

      const result = await repository.update('1', updatedAuth);

      expect(mockDBService.update).toHaveBeenCalledWith('auth', '1', updatedAuth);
      expect(result).toBeUndefined();
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockDBService.update.mockRejectedValue(new Error('Database error'));

      await expect(repository.update('1', mockAuth)).rejects.toThrow(InternalServerErrorException);
    });
  });
}); 