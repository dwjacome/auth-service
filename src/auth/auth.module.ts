import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './infrastructure/auth.controller';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

import { PassportModule } from '@nestjs/passport';

// Repositories
import { AuthAdapterRepository } from './infrastructure/adapters/auth.adapter.repository';

// Ports
import { AUTH_REPOSITORY } from './domain/ports/auth.port.repository';

// Database
import { CosmosDBModule } from '../dababases/cosmos.module';

const REPOSITORIES = [
  { provide: AUTH_REPOSITORY, useClass: AuthAdapterRepository },
];

const SERVICES = [
  AuthService
];

@Module({
  imports: [
    ConfigModule,
    CosmosDBModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
      }),
    }),
  ],
  exports: [JwtStrategy, JwtModule, PassportModule, AuthService],
  controllers: [AuthController],
  providers: [...SERVICES, ...REPOSITORIES, JwtStrategy],
})
export class AuthModule { }
