/**
 * Bộ lọc lỗi toàn cục: ghi log lỗi (đã che mật khẩu / token trong body, query) và trả JSON { statusCode, message, error }.
 * Dùng bởi: src/main.ts (app.useGlobalFilters).
 * Lưu ý: sai mật khẩu cũng ném exception, nên SENSITIVE_KEYS phải đủ, nếu không mật khẩu nằm trong logs/error-*.log.
 * Lỗi ngoài HttpException (vd TypeORM, lộ tên bảng / cột) chỉ trả message chi tiết khi NODE_ENV khác production.
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../logger/logger.service';

const SENSITIVE_KEYS =
  /^(password|currentPassword|newPassword|confirmPassword|oldPassword|token|accessToken|refreshToken|secret|otp|code|authorization|apiKey)$/i;

function redactSensitiveValues(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value))
    return value.map((item) => redactSensitiveValues(item, depth + 1));
  const redacted: Record<string, unknown> = {};
  for (const [key, fieldValue] of Object.entries(
    value as Record<string, unknown>,
  )) {
    redacted[key] = SENSITIVE_KEYS.test(key)
      ? '[ĐÃ CHE]'
      : redactSensitiveValues(fieldValue, depth + 1);
  }
  return redacted;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    try {
      LoggerService.error('RAW EXCEPTION', {
        exception,
      });
    } catch (loggerError) {
      console.error('Logger failed:', loggerError);
    }

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message: any = 'Lỗi máy chủ, vui lòng thử lại';
    let error: any = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      message = (exceptionResponse as any).message || message;
      error = (exceptionResponse as any).error || null;
    } else if (exception?.message && process.env.NODE_ENV !== 'production') {
      message = exception.message;
    }

    try {
      LoggerService.error('HTTP Exception', {
        status,
        path: request.url,
        method: request.method,
        body: redactSensitiveValues(request.body),
        query: redactSensitiveValues(request.query),
        message,
        error,
        stack: exception?.stack,
      });
    } catch (loggerError) {
      console.error('Logger failed:', loggerError);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    });
  }
}
