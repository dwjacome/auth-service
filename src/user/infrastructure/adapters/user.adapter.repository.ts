import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { UserRepository } from "src/user/domain/ports/user.port.repository";

import { DBService } from "src/dababases/db.service";
import { IUser } from "src/user/domain/interfaces";

@Injectable()
export class UserAdapterRepository implements UserRepository {
    private readonly container: string;

    constructor(private db: DBService) {
        this.container = 'user';
    }

    async create(body: IUser): Promise<IUser> {
        try {
            return await this.db.create(this.container, body);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findOne(id: string): Promise<any> {
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.id = @id AND c.status = @status',
                parameters: [{ name: '@id', value: id }, { name: '@status', value: 'active' }]
            };

            const results = await this.db.query(this.container, querySpec);
            return results[0] ?? null;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findByUsername(username: string): Promise<IUser> {
        try {
            const querySpec = {
                query: 'SELECT TOP 1 * FROM c WHERE c.username = @username AND c.status = @status',
                parameters: [{ name: '@username', value: username }, { name: '@status', value: 'active' }]
            };

            const results = await this.db.query(this.container, querySpec);
            return results[0] ?? null;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findByEmail(email: string): Promise<IUser> {
        try {
            const querySpec = {
                query: 'SELECT TOP 1 * FROM c WHERE c.email = @email AND c.status = @status',
                parameters: [{ name: '@email', value: email }, { name: '@status', value: 'active' }]
            };

            const results = await this.db.query(this.container, querySpec);
            return results[0] ?? null;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async update(id: string, body: IUser): Promise<IUser> {
        try {
            return await this.db.update(this.container, id, body);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async delete(id: string): Promise<any> {
        try {
            return await this.db.delete(this.container, id);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

}