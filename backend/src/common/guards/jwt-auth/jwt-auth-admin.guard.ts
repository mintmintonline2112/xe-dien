/**
 * Guard xác thực JWT cho route admin (strategy 'jwt-admin'); bỏ qua route có @Public(), trả 401 JWT_EXPIRED khi token hết hạn.
 * Dùng bởi: các controller trong modules/admin.
 */
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class JwtAdminAuthGuard extends AuthGuard('jwt-admin') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest(error: any, user: any, info: any) {
    if (error || !user) {
      if (info?.message === 'jwt expired') {
        throw new UnauthorizedException('JWT_EXPIRED');
      }
      throw new UnauthorizedException('UNAUTHORIZED');
    }
    return user;
  }
}
