import { CosmosClient } from "@azure/cosmos";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class DBService {
    constructor(
        @Inject('COSMOS_DB_CONNECTION') private cosmosConnection: { client: CosmosClient, database: any }
    ) { }

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

    async update(name: string, id: any, data: any) {
        const container = await this.container(name);
        const { resource: resp } = await container.item(id, [id]).replace(data);
        return resp;
    }

}