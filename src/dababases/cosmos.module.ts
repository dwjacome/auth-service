import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CosmosClient } from '@azure/cosmos';
import { DBService } from './db.service';

@Global()
@Module({})
export class CosmosDBModule {
  static forRoot(): DynamicModule {
    return {
      module: CosmosDBModule,
      providers: [
        {
          provide: 'COSMOS_DB_CONNECTION',
          useFactory: async (configService: ConfigService) => {
            const endpoint = configService.get<string>('COSMOS_DB_ENDPOINT');
            const key = configService.get<string>('COSMOS_DB_KEY');
            const client = new CosmosClient({ endpoint, key });

            const database = client.database(configService.get<string>('COSMOS_DB_NAME'));
            return { client, database };
          },
          inject: [ConfigService],
        },
        DBService,
      ],
      exports: ['COSMOS_DB_CONNECTION', DBService],
    };
  }
}
