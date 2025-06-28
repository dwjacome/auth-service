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

export interface IClientResponse {
    id_client: string;
    country: string;
    phone: string;
    name: string;
    url: string;
    updated_at: number;
}

export interface IConfigResponse {
    id_config: string;
    account: {
        verify_phone: boolean;
        [key: string]: any;
    };
} 