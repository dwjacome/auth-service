import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CosmosDBModule } from './dababases/cosmos.module';
import { UtilsService } from './common/utils.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CosmosDBModule.forRoot(),
    AuthModule,
  ],
  providers: [UtilsService],
})
export class AppModule { }
