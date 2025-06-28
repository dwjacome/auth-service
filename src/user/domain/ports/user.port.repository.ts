import { IUser } from "../interfaces";

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface UserRepository {
    create(body: IUser): Promise<IUser>;
    findOne(id: string): Promise<IUser>;
    findByUsername(username: string): Promise<IUser>;
    findByEmail(email: string): Promise<IUser>;
    update(id: string, body: IUser): Promise<IUser>;
    delete(id: string): Promise<any>;
}