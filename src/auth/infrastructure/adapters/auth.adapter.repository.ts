import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { AuthRepository } from "src/auth/domain/ports/auth.port.repository";
import { IAuth, IToken } from "src/auth/domain/interfaces";

import { DBService } from "src/dababases/db.service";

@Injectable()
export class AuthAdapterRepository implements AuthRepository {
    private readonly container: string;

    constructor(private db: DBService) {
        this.container = 'auth';
    }

    async create(body: IAuth): Promise<IAuth> {
        try {
            return await this.db.create(this.container, body);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findOne(id: string): Promise<IAuth> {
        try {
            const querySpec = {
                query: 'SELECT TOP 1 * FROM c WHERE c.id = @id AND c.status = @status',
                parameters: [{ name: '@id', value: id }, { name: '@status', value: 'active' }]
            };

            const results = await this.db.query(this.container, querySpec);
            return results[0] ?? null;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async update(id: string, body: IAuth): Promise<void> {
        try {
            await this.db.update(this.container, id, body);
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findByRefresh(refresh: IToken): Promise<IAuth> {
        try {
            const querySpec = {
                query: 'SELECT TOP 1 * FROM c WHERE c.refresh_token = @refresh',
                parameters: [{ name: '@refresh', value: refresh.token }]
            };

            const results = await this.db.query(this.container, querySpec);
            return results[0] ?? null;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async findByUsername(username: string): Promise<IAuth> {
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

    async findByEmail(email: string): Promise<IAuth> {
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

}