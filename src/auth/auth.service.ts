import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { DBService } from 'src/dababases/db.service';
import { ResponsesService, UtilsService, WordsService } from 'src/common';
import { PasswordDto, UserDto } from './dto';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private db: DBService,
        private readonly jwtService: JwtService,
        private utils: UtilsService, private responses: ResponsesService, private words: WordsService
    ) { }

    async login(body: UserDto): Promise<any> {
        const { data } = await this.findUserByUsername(body);
        if (data && await bcrypt.compare(body.password, data[0].password)) {
            const req = {
                roles: data[0].roles
            };
            return { token: this.jwtService.sign(req) };
        }
        throw new UnauthorizedException('Credentials are not valid.');
    }

    async findUserByUsername(body: UserDto): Promise<any> {
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.username = @username',
                parameters: [
                    { name: '@username', value: body.username }
                ],
            };

            const user = await this.db.query('auth', querySpec);
            if (!user.length) throw new UnauthorizedException('Credentials are not valid.');

            return this.responses.response(200, this.words.user.find, user);
        } catch (error) {
            return this.responses.response(error.code, error.message);
        }
    }

    async createUser(body: UserDto, roles: string[]): Promise<any> {
        try {
            const { data } = await this.findUserByUsername(body);
            if (data.length > 0) throw new ConflictException('Username not available.');
            const hashedPassword = await bcrypt.hash(body.password, 10);
            const userToSave: User = {
                ...body,
                password: hashedPassword,
                event_date: this.utils.getDate(),
                event_time: this.utils.getTime(),
                update_date: this.utils.getDate(),
                update_time: this.utils.getTime(),
                roles: roles,
                status: 'active'
            };
            await this.db.create('auth', userToSave);

            return this.responses.response(200, this.words.user.create);
        } catch (error) {
            return this.responses.response(error.code, error.message);
        }
    }

    async findUserById(id: string): Promise<any> {
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.id = @id',
                parameters: [
                    { name: '@id', value: id }
                ],
            };

            const user = await this.db.query('auth', querySpec);
            if (!user.length) throw new UnauthorizedException('Credentials are not valid.');

            return this.responses.response(200, this.words.user.find, user);
        } catch (error) {
            return this.responses.response(error.code, error.message);
        }
    }

    async updateUser(username: string, data: PasswordDto): Promise<any> {
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.username = @username',
                parameters: [{ name: '@username', value: username }],
            };

            const user = await this.db.query('auth', querySpec);
            if (!user.length) throw new UnauthorizedException('Credentials are not valid.');

            const hashedPassword = await bcrypt.hash(data.password, 10);
            const updatedUser: User = {
                ...user[0],
                password: hashedPassword,
                updateDate: this.utils.getDate(),
                updateTime: this.utils.getTime()
            };
            await this.db.update('auth', user[0].id, updatedUser);

            return this.responses.response(200, this.words.user.update);
        } catch (error) {
            return this.responses.response(error.code, error.message);
        }
    }

    async deleteUser(username: string): Promise<any> {
        try {
            const querySpec = {
                query: 'SELECT * FROM c WHERE c.username = @username',
                parameters: [{ name: '@username', value: username }],
            };

            const user = await this.db.query('auth', querySpec);
            if (!user.length) throw new UnauthorizedException('Credentials are not valid.');

            const userToDelete: User = {
                ...user[0],
                status: 'deleted',
                updateDate: this.utils.getDate(),
                updateTime: this.utils.getTime()
            };
            await this.db.update('auth', user[0].id, userToDelete);

            return this.responses.response(200, this.words.user.delete);
        } catch (error) {
            return this.responses.response(error.code, error.message);
        }
    }
}
