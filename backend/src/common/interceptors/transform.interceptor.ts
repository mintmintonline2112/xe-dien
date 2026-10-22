/**
 * Bọc mọi response thành { statusCode, message, data } (data lấy `results` nếu có).
 * Dùng bởi: src/main.ts (app.useGlobalInterceptors).
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => ({
        statusCode: response.statusCode,
        message: data?.message || 'Success',
        data: data?.results || data || null,
      })),
    );
  }
}
