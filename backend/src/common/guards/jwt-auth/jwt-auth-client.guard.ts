/**
 * Guard xác thực JWT cho người dùng phía client (strategy 'jwt-user'); bỏ qua route có @Public().
 * Dùng bởi: hiện chưa có controller nào dùng.
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
export class JwtUserAuthGuard extends AuthGuard('jwt-user') {
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
