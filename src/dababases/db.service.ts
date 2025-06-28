import { CosmosClient } from "@azure/cosmos";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DBService implements OnModuleInit {
    db: any;

    private readonly containers = [
        'auth',
        'user',
    ];

    constructor(
        @Inject('COSMOS_DB_CONNECTION') private cosmosConnection: { client: CosmosClient, database: any },
        private readonly config: ConfigService
    ) {
        this.db = this.config.get<string>('COSMOS_DB_NAME');
    }

    async onModuleInit() {
        await this.createDatabaseIfNotExist();
        await this.createTablesIfNotExist();
    }

    private async createDatabaseIfNotExist() {
        const { client } = this.cosmosConnection;
        try {
            const { resources: databases } = await client.databases.readAll().fetchAll();
            const dbExists = databases.some(db => db.id === this.db);

            if (!dbExists) {
                console.log(`La base de datos ${this.db} no existe. Creándola...`);
                await client.databases.create({ id: this.db });
                console.log(`Base de datos ${this.db} creada exitosamente.`);
            }
        } catch (error) {
            console.error('Error al verificar o crear la base de datos:', error);
            throw error;
        }
    }

    private async createTablesIfNotExist() {
        const { database } = this.cosmosConnection;

        for (const table of this.containers) {
            try {
                await database.container(table).read();
            } catch (error) {
                if (error.code === 404) {
                    console.log(`El contenedor "${table}" no existe. Creando contenedor...`);
                    const containerDefinition = {
                        id: table,
                        partitionKey: { paths: ['/id'], kind: 'Hash' },
                    };

                    await database.containers.create(containerDefinition);
                    console.log(`Contenedor "${table}" creado exitosamente.`);
                } else {
                    throw error;
                }
            }
        }
    }

    private async createTableIfNotExist(name: string) {
        const { database } = this.cosmosConnection;

        try {
            await database.container(name).read();
        } catch (error) {
            if (error.code === 404) {
                const containerDefinition = {
                    id: name,
                    partitionKey: { paths: ['/id'], kind: 'Hash' },
                };

                await database.containers.create(containerDefinition);
                console.log(`Contenedor "${name}" creado exitosamente.`);
            }
        }
    }

    async container(name: string) {
        const { database } = this.cosmosConnection;
        return database.container(name);
    }

    async query(name: string, querySpec: any) {
        const container = await this.container(name);
        const { resources: resp } = await container.items.query(querySpec).fetchAll();
        return resp;
    }

    async create(name: string, data: any) {
        const container = await this.container(name);
        const { resource: resp } = await container.items.create(data);
        return resp;
    }

    async bulk(name: string, data: any) {
        const container = await this.container(name);
        const dataToSave = data.map((item: any) => ({
            operationType: 'Create',
            resourceBody: item,
        }));
        const { resource: resp } = await container.items.bulk(dataToSave);
        return resp;
    }

    async update(name: string, id: any, data: any) {
        const container = await this.container(name);
        const { resource: resp } = await container.item(id, [id]).replace(data);
        return resp;
    }

    async delete(name: string, id: string) {
        const container = await this.container(name);
        const { resource: resp } = await container.item(id, [id]).delete();
        return resp;
    }

}