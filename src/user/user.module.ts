import { Module } from '@nestjs/common';
import { UserController } from './infrastructure/user.controller';
import { UserService } from './application/user.service';

// Repositories
import { UserAdapterRepository } from './infrastructure/adapters/user.adapter.repository';

// Ports
import { USER_REPOSITORY } from './domain/ports/user.port.repository';

// Auth Module
import { AuthModule } from '../auth/auth.module';

// Database
import { CosmosDBModule } from '../dababases/cosmos.module';

const REPOSITORIES = [
  { provide: USER_REPOSITORY, useClass: UserAdapterRepository },
];

const SERVICES = [
  UserService
];

@Module({
  imports: [AuthModule, CosmosDBModule.forRoot()],
  controllers: [UserController],
  providers: [...SERVICES, ...REPOSITORIES],
  exports: [UserService],
})
export class UserModule { }
