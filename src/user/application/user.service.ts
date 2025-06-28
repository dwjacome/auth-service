import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, Logger } from "@nestjs/common";
import { IApiResponse, IAuthResponse, IUserResponse } from "../../common/interfaces/response.interface";

import { USER_REPOSITORY, UserRepository } from "../domain/ports/user.port.repository.js";

import { MessagesConstant } from "../../common/constants";
import { ResponsesUtil, FunctionsUtil } from "../../common/utils";

import { ILogin, IUser } from "../domain/interfaces";
import { AuthService } from "src/auth/application/auth.service";
import * as bcrypt from 'bcryptjs';
import { IValidRoles } from "../../common/interfaces/valid-roles.interface.js";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        private readonly authService: AuthService
    ) { }

    private async validateExistingUser(email?: string, username?: string): Promise<void> {
        const userFound = email ? await this.userRepository.findByEmail(email) : await this.userRepository.findByUsername(username);
        if (userFound) {
            throw new BadRequestException('The user exist');
        }
    }

    async create(body: Partial<IUser>): Promise<ResponsesUtil> {
        try {
            await this.validateExistingUser(body.email, body.username);

            const authCreated = await this.authService.create(body) as IApiResponse<IAuthResponse>;
            const isClient = Array.isArray(body.roles) && body.roles.includes(IValidRoles.client);


            const userToSave: IUser = {
                id_auth: authCreated?.data?.[0]?.id,
                ...body,
                password: authCreated?.data?.[0]?.password,
                name: 'default',
                status: 'active',
                roles: isClient ? ['client'] : body.roles,
                created_at: FunctionsUtil.generateUnixTimestamp(),
                updated_at: FunctionsUtil.generateUnixTimestamp()
            };

            const userCreated = await this.userRepository.create(userToSave);
            return ResponsesUtil.response(200, MessagesConstant.user.create, [{ id: userCreated.id }]);
        } catch (error) {
            this.logger.error(`Error creating user: ${error.message}`, error.stack);
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }

    async login(body: ILogin): Promise<any> {
        try {
            const user = await this.validateLoginCredentials(body);

            return await this.generateLoginResponse(user);
        } catch (error) {
            this.logger.error(`Error during login: ${error.message}`, error.stack);
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException('Error durante el inicio de sesión');
        }
    }

    private async validateLoginCredentials(body: ILogin) {
        const isEmail = body.user.includes("@");
        const user = isEmail ?
            await this.userRepository.findByEmail(body.user) :
            await this.userRepository.findByUsername(body.user);

        if (!user || !(await bcrypt.compare(body.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials.');
        }
        user.password = body.password;
        return user;
    }

    private async generateLoginResponse(user: IUser): Promise<ResponsesUtil> {
        const req = {
            roles: user.roles
        };

        const authResponse = await this.authService.login({
            user: user.email || user.username,
            password: user.password,
            payload: req
        }) as IApiResponse<IAuthResponse>;

        const responseData = {
            user: {
                id_user: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                birth_date: user.birth_date ? new Date(user.birth_date).toISOString() : undefined,
                roles: user.roles,
                refresh: authResponse?.data?.[0]?.auth?.refresh_token
            },
            token: authResponse?.data?.[0]?.token
        } as const;
        return ResponsesUtil.response(200, MessagesConstant.auth.success, [responseData]);
    }

    async findOne(id: string): Promise<ResponsesUtil> {
        try {
            const user = await this.userRepository.findOne(id);
            if (!user) throw new UnauthorizedException('Invalid credentials.');
            delete user.password;
            console.log(user)

            return ResponsesUtil.response(200, MessagesConstant.user.find, [user]);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }

    async update(id: string, body: Partial<IUser>): Promise<ResponsesUtil> {
        try {
            const userFound = await this.userRepository.findOne(id);
            if (!userFound) throw new UnauthorizedException('Invalid credentials.');

            const userToSave: IUser = {
                ...userFound,
                updated_at: FunctionsUtil.generateUnixTimestamp()
            };

            if (body.email) {
                const userToSave = await this.userRepository.findByEmail(body.email);
                if (userToSave) throw new BadRequestException('The user exist');
                userToSave.email = body.email;
            }

            if (body.username) {
                const userToSave = await this.userRepository.findByUsername(body.username);
                if (userToSave) throw new BadRequestException('The user exist');
                userToSave.username = body.username;
            }

            if (body.password) userToSave.password = await bcrypt.hash(body.password, 10);
            if (body.name) userToSave.name = body.name;
            if (body.birth_date) userToSave.birth_date = body.birth_date;
            if (body.status) userToSave.status = body.status;

            const userUpdated = await this.userRepository.update(userFound.id, { ...userToSave });
            await this.authService.update(userFound.id_auth, body);

            return ResponsesUtil.response(200, MessagesConstant.user.update, [userUpdated]);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }

    async delete(id: string): Promise<any> {
        try {
            const user = await this.userRepository.findOne(id);
            if (!user) throw new UnauthorizedException('Invalid credentials.');

            const userToDelete: IUser = {
                ...user,
                status: 'deleted',
                updated_at: FunctionsUtil.generateUnixTimestamp()
            };
            await this.userRepository.update(user.id, userToDelete);
            await this.authService.delete(user.id_auth);

            return ResponsesUtil.response(200, MessagesConstant.user.delete);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }

}