import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CosmosDBModule } from 'src/dababases/cosmos.module';
import { DBService } from 'src/dababases/db.service';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UtilsService, ResponsesService, WordsService } from 'src/common';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    CosmosDBModule,
    ConfigModule,
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
  providers: [AuthService, JwtStrategy, DBService, UtilsService, ResponsesService, WordsService],
  exports: [JwtStrategy, PassportModule, JwtModule],
  controllers: [AuthController],
})
export class AuthModule { }
