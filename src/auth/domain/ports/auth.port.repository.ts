import { IAuth, IToken } from "../interfaces";

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';

export interface AuthRepository {
    create(body: Partial<IAuth>): Promise<IAuth>;
    findOne(id: string): Promise<IAuth>;
    update(id: string, body: Partial<IAuth>): Promise<void>;
    findByRefresh(refresh: IToken): Promise<IAuth>;
    findByUsername(username: string): Promise<IAuth>;
    findByEmail(email: string): Promise<IAuth>;
}