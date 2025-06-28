export interface IAuth {
    id?: string;
    email: string;
    username: string;
    password: string;
    refresh_token?: string;
    status: 'active' | 'inactive' | 'locked'| 'deleted';
    created_at: number;
    updated_at: number;
}