import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponsesService {
    response(code: number, message: string, data: [] = []): object {
        const resp = {
            code,
            message,
            data
        }
        return resp;
    }
}
