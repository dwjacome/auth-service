import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '../application/user.service';
import { CreateUserDto, LoginDto, UpdateUserDto } from './dtos';
import { ResponsesUtil } from '../../common/utils';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: any;

  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    roles: ['client'],
    status: 'active',
  };

  const mockLoginResponse: ResponsesUtil = {
    status: 200,
    message: 'Login successful',
    data: [{
      user: mockUser,
      token: 'access-token',
    }],
  };

  beforeEach(async () => {
    mockUserService = {
      create: jest.fn(),
      login: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
      roles: ['client'],
    };

    it('should create a user successfully', async () => {
      const expectedResponse: ResponsesUtil = {
        status: 200,
        message: 'User created successfully',
        data: [{ id: '1' }],
      };
      mockUserService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      user: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully', async () => {
      mockUserService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(mockUserService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('finOne', () => {
    it('should find user by id successfully', async () => {
      const expectedResponse: ResponsesUtil = {
        status: 200,
        message: 'User found successfully',
        data: [mockUser],
      };
      mockUserService.findOne.mockResolvedValue(expectedResponse);

      const result = await controller.finOne('1');

      expect(mockUserService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
      birth_date: 1234567890,
      status: 'active',
    };

    it('should update user successfully', async () => {
      const expectedResponse: ResponsesUtil = {
        status: 200,
        message: 'User updated successfully',
        data: [{ ...mockUser, ...updateUserDto }],
      };
      mockUserService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update('1', updateUserDto);

      expect(mockUserService.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const expectedResponse: ResponsesUtil = {
        status: 200,
        message: 'User deleted successfully',
        data: [],
      };
      mockUserService.delete.mockResolvedValue(expectedResponse);

      const result = await controller.delete('1');

      expect(mockUserService.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResponse);
    });
  });
}); 