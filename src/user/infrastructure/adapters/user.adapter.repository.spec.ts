import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { UserAdapterRepository } from './user.adapter.repository';
import { DBService } from '../../../dababases/db.service';
import { IUser } from '../../domain/interfaces';

describe('UserAdapterRepository', () => {
  let repository: UserAdapterRepository;
  let mockDBService: any;

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

  beforeEach(async () => {
    mockDBService = {
      create: jest.fn(),
      query: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAdapterRepository,
        {
          provide: DBService,
          useValue: mockDBService,
        },
      ],
    }).compile();

    repository = module.get<UserAdapterRepository>(UserAdapterRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      mockDBService.create.mockResolvedValue(mockUser);

      const result = await repository.create(mockUser);

      expect(mockDBService.create).toHaveBeenCalledWith('user', mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockDBService.create.mockRejectedValue(new Error('Database error'));

      await expect(repository.create(mockUser)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should find user by id successfully', async () => {
      mockDBService.query.mockResolvedValue([mockUser]);

      const result = await repository.findOne('1');

      expect(mockDBService.query).toHaveBeenCalledWith('user', {
        query: 'SELECT * FROM c WHERE c.id = @id AND c.status = @status',
        parameters: [{ name: '@id', value: '1' }, { name: '@status', value: 'active' }],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockDBService.query.mockResolvedValue([]);

      const result = await repository.findOne('1');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should find user by username successfully', async () => {
      mockDBService.query.mockResolvedValue([mockUser]);

      const result = await repository.findByUsername('testuser');

      expect(mockDBService.query).toHaveBeenCalledWith('user', {
        query: 'SELECT TOP 1 * FROM c WHERE c.username = @username AND c.status = @status',
        parameters: [{ name: '@username', value: 'testuser' }, { name: '@status', value: 'active' }],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockDBService.query.mockResolvedValue([]);

      const result = await repository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      mockDBService.query.mockResolvedValue([mockUser]);

      const result = await repository.findByEmail('test@example.com');

      expect(mockDBService.query).toHaveBeenCalledWith('user', {
        query: 'SELECT TOP 1 * FROM c WHERE c.email = @email AND c.status = @status',
        parameters: [{ name: '@email', value: 'test@example.com' }, { name: '@status', value: 'active' }],
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockDBService.query.mockResolvedValue([]);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockDBService.update.mockResolvedValue(updatedUser);

      const result = await repository.update('1', updatedUser);

      expect(mockDBService.update).toHaveBeenCalledWith('user', '1', updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockDBService.update.mockRejectedValue(new Error('Database error'));

      await expect(repository.update('1', mockUser)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockDBService.delete.mockResolvedValue({ deleted: true });

      const result = await repository.delete('1');

      expect(mockDBService.delete).toHaveBeenCalledWith('user', '1');
      expect(result).toEqual({ deleted: true });
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockDBService.delete.mockRejectedValue(new Error('Database error'));

      await expect(repository.delete('1')).rejects.toThrow(InternalServerErrorException);
    });
  });
}); 