export interface IUser {
    id?: string;
    id_auth?: string;
    email?: string;
    username?: string;
    password: string;
    name: string;
    birth_date?: number;
    roles?: string[];
    status: 'active' | 'inactive' | 'locked' | 'deleted';
    created_at: number;
    updated_at: number;
}