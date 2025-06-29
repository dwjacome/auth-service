export interface IApiResponse<T = any> {
    code: number;
    message: string;
    data?: T[];
}

export interface IAuthResponse {
    id: string;
    password: string;
    auth: {
        refresh_token: string;
    };
    token: string;
}

export interface IUserResponse {
    id: string;
    username: string;
    email: string;
    name: string;
    birth_date?: string;
    roles: string[];
}