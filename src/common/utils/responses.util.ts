export class ResponsesUtil {
    static response(code: number, message: string, data: Array<any> = []): object {
        return {
            code,
            message,
            data
        };
    };
};