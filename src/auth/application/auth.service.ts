import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';

import { AUTH_REPOSITORY, AuthRepository } from "../domain/ports/auth.port.repository";

import { MessagesConstant } from "../../common/constants";
import { ResponsesUtil, FunctionsUtil } from "../../common/utils";
import { IAuth } from "../domain/interfaces/auth.interface";

import { ILogin, IToken } from "../domain/interfaces";

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @Inject(AUTH_REPOSITORY) private readonly authRepository: AuthRepository
    ) { }

    async create(body: Partial<IAuth>): Promise<ResponsesUtil> {
        try {
            const authFound = body.email ? await this.authRepository.findByEmail(body.email) : await this.authRepository.findByUsername(body.username);
            if (authFound) throw new BadRequestException('The user exist');

            const hashedPassword = await bcrypt.hash(body.password, 10);
            const authToSave: IAuth = {
                email: body.email,
                username: body.username,
                password: hashedPassword,
                status: 'active',
                created_at: FunctionsUtil.generateUnixTimestamp(),
                updated_at: FunctionsUtil.generateUnixTimestamp()
            };

            const authCreated = await this.authRepository.create(authToSave);
            return ResponsesUtil.response(200, MessagesConstant.user.create, [{ id: authCreated.id, password: authCreated.password }]);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }

    async findOne(id: string): Promise<ResponsesUtil> {
        try {
            const authFound: IAuth = await this.authRepository.findOne(id);
            if (!authFound) throw new UnauthorizedException('Invalid credentials.');
            delete authFound.password;

            return ResponsesUtil.response(200, MessagesConstant.user.find, [authFound]);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }

    async update(id: string, body: Partial<IAuth>): Promise<ResponsesUtil> {
        try {
            const authFound = await this.authRepository.findOne(id);
            if (!authFound) throw new UnauthorizedException('Invalid credentials.');

            const authToSave: IAuth = {
                ...authFound,
                updated_at: FunctionsUtil.generateUnixTimestamp()
            };

            if (body.email) {
                const authFound = await this.authRepository.findByEmail(body.email);
                if (authFound) throw new BadRequestException('The user exist');
                authToSave.email = body.email;
            }
            if (body.username) {
                const authFound = await this.authRepository.findByUsername(body.username);
                if (authFound) throw new BadRequestException('The user exist');
                authToSave.username = body.username;
            }

            if (body.password) authToSave.password = await bcrypt.hash(body.password, 10);

            await this.authRepository.update(authFound.id, authToSave);

            return ResponsesUtil.response(200, MessagesConstant.user.update);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }

    async delete(id: string): Promise<ResponsesUtil> {
        try {
            const authFound = await this.authRepository.findOne(id);
            if (!authFound) throw new UnauthorizedException('Invalid credentials.');

            const userToDelete: IAuth = {
                ...authFound,
                status: 'deleted',
                updated_at: FunctionsUtil.generateUnixTimestamp()
            };
            await this.authRepository.update(authFound.id, userToDelete);

            return ResponsesUtil.response(200, MessagesConstant.user.delete);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }

    async createToken(refresh: IToken) {
        try {
            const lastToken = await this.authRepository.findByRefresh(refresh);
            if (!lastToken) throw new UnauthorizedException('Invalid credentials.');

            const decodedRefreshToken = this.jwtService.decode(refresh.token) as any;
            if (!decodedRefreshToken) throw new UnauthorizedException('Invalid refresh token.');
            delete decodedRefreshToken.iat;
            delete decodedRefreshToken.exp;

            const newToken = this.jwtService.sign(decodedRefreshToken, { expiresIn: this.configService.get<string>('JWT_EXPIRATION') });

            return ResponsesUtil.response(200, MessagesConstant.auth.token, [{ token: newToken }]);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }

    async login(body: ILogin): Promise<ResponsesUtil> {
        try {
            const isEmail = body.user.includes("@");
            console.log(body)
            const authFound = isEmail ? await this.authRepository.findByEmail(body.user) : await this.authRepository.findByUsername(body.user);
            if (!authFound || !(await bcrypt.compare(body.password, authFound.password))) {
                throw new UnauthorizedException('Invalid credentials.');
            }

            authFound.refresh_token = this.jwtService.sign(body.payload, { expiresIn: '7d' });

            await this.authRepository.update(authFound.id, authFound);
            delete authFound.password;
            const obj: any = { auth: authFound, token: this.jwtService.sign(body.payload) };

            return ResponsesUtil.response(200, MessagesConstant.auth.success, [obj]);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }

}