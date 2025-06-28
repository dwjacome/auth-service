import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
    constructor(
        public readonly message: string,
        public readonly error: string,
        statusCode: HttpStatus = HttpStatus.BAD_REQUEST
    ) {
        super({ message, error, statusCode }, statusCode);
    }

    getMessage(): string {
        return this.message;
    }

    getError(): string {
        return this.error;
    }

    getHttpStatus(): HttpStatus {
        return this.getStatus();
    }
}
