import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpExceptionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpExceptionInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Error interno del servidor';
        let details = null;

        if (error instanceof HttpException) {
          status = error.getStatus();
          const response = error.getResponse();
          message = typeof response === 'string' ? response : response['message'];
          details = typeof response === 'object' ? response['error'] : null;
        }

        this.logger.error(`${status} - ${message}`, error.stack);

        return throwError(() => ({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: context.switchToHttp().getRequest().url,
          message,
          details,
        }));
      }),
    );
  }
} 