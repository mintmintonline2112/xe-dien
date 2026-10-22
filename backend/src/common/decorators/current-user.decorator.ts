/**
 * Decorator tham số @CurrentUser() lấy tài khoản admin đã đăng nhập (request.user) trong controller.
 * Dùng bởi: hiện chưa có controller nào dùng.
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtAdmin } from 'src/modules/admin/auth/strategies/jwt.strategy';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtAdmin => {
    const request = context.switchToHttp().getRequest();
    return request.user;
  },
);
