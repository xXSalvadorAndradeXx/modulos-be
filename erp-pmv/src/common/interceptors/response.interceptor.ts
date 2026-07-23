import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        // Si ya es una respuesta paginada (tiene meta), no envolver
        if (data && typeof data === 'object' && 'meta' in data && 'data' in data) {
          return data;
        }
        // Si es null (ej. 204 No Content), retornar tal cual
        if (data === null || data === undefined) {
          return data;
        }
        return {
          data,
          statusCode: response.statusCode,
        };
      }),
    );
  }
}