import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { IJwtPayload } from '../../domain/interfaces';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let mockConfigService: any;

  const mockPayload: IJwtPayload = {
    roles: ['client'],
  };

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should validate payload and return it successfully', async () => {
      const result = await strategy.validate(mockPayload);

      expect(result).toEqual(mockPayload);
    });

    it('should handle payload with multiple roles', async () => {
      const multiRolePayload: IJwtPayload = {
        roles: ['client', 'admin'],
      };

      const result = await strategy.validate(multiRolePayload);

      expect(result).toEqual(multiRolePayload);
    });

    it('should handle payload with additional properties', async () => {
      const extendedPayload = {
        ...mockPayload,
        sub: '1',
        user: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890,
      };

      const result = await strategy.validate(extendedPayload);

      expect(result).toEqual(extendedPayload);
    });

    it('should return payload even if roles is empty', async () => {
      const payloadWithoutRoles: IJwtPayload = {
        roles: [],
      };

      const result = await strategy.validate(payloadWithoutRoles);

      expect(result).toEqual(payloadWithoutRoles);
    });
  });
}); 