/**
 * Bắt lỗi 401 trên nhóm route auth, trả JSON và chỉ xoá cookie phiên khi chính /refresh thất bại.
 * Dùng bởi: modules/admin/auth/auth.controller.ts.
 * Lưu ý: 401 khác (vd access token hết hạn khi gọi /me) phải GIỮ refreshToken để frontend gọi /refresh;
 * xoá ở đó là đá người dùng ra sau mỗi chu kỳ access token dù refresh token còn hạn 7 ngày.
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();
    const status = exception.getStatus();

    if (request.path.endsWith('/refresh')) {
      response.clearCookie('accessToken');
      response.clearCookie('refreshToken');
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: 'Unauthorized',
    });
  }
}
