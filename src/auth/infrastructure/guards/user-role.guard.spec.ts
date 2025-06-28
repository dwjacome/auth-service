import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleGuard } from './user-role.guard';
import { IValidRoles } from '../../../common/interfaces/valid-roles.interface';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let mockReflector: any;
  let mockExecutionContext: any;

  beforeEach(async () => {
    mockReflector = {
      get: jest.fn(),
    };

    mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: {
            roles: ['client'],
          },
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRoleGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<UserRoleGuard>(UserRoleGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow access when user has required role', () => {
      mockReflector.get.mockReturnValue([IValidRoles.client]);
      mockExecutionContext.getHandler.mockReturnValue({});

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has multiple required roles', () => {
      mockReflector.get.mockReturnValue([IValidRoles.client, IValidRoles.admin]);
      mockExecutionContext.getHandler.mockReturnValue({});

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when no roles are required', () => {
      mockReflector.get.mockReturnValue(undefined);
      mockExecutionContext.getHandler.mockReturnValue({});

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should allow access when user has superadmin role', () => {
      mockReflector.get.mockReturnValue([IValidRoles.admin]);
      mockExecutionContext.getHandler.mockReturnValue({});
      mockExecutionContext.switchToHttp().getRequest().user = {
        username: 'superadmin',
        roles: [IValidRoles.superadmin],
      };

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      mockReflector.get.mockReturnValue([IValidRoles.admin]);
      mockExecutionContext.getHandler.mockReturnValue({});
      mockExecutionContext.switchToHttp().getRequest().user.roles = [IValidRoles.client];

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user has no roles', () => {
      mockReflector.get.mockReturnValue([IValidRoles.client]);
      mockExecutionContext.getHandler.mockReturnValue({});
      mockExecutionContext.switchToHttp().getRequest().user.roles = [];

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user object is missing', () => {
      mockReflector.get.mockReturnValue([IValidRoles.client]);
      mockExecutionContext.getHandler.mockReturnValue({});
      mockExecutionContext.switchToHttp().getRequest().user = undefined;

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
    });

    it('should handle case when user roles is undefined', () => {
      mockReflector.get.mockReturnValue([IValidRoles.client]);
      mockExecutionContext.getHandler.mockReturnValue({});
      mockExecutionContext.switchToHttp().getRequest().user.roles = undefined;

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(ForbiddenException);
    });
  });
}); 