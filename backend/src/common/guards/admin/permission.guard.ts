/**
 * Guard phân quyền admin: so mã quyền của người dùng (vd PAGE_UPDATE) với @Permissions hoặc tên handler CRUD chuẩn (findAll → LIST…).
 * Dùng bởi: các controller trong modules/admin (pages, blog-posts, library, roles, staffs, settings…).
 * Lưu ý: handler tên riêng (không phải CRUD chuẩn) mà quên gắn @Permissions sẽ bị TỪ CHỐI (trước đây cho qua nên
 * POST /admin/library/upload ai đăng nhập cũng gọi được). Thêm route mới → nhớ gắn @Permissions('...').
 */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return false;

    const userPermissions: string[] =
      user.permissions?.map((permission: string) => permission.toUpperCase()) ||
      [];

    if (userPermissions.length === 0) return false;

    const handler = context.getHandler();
    const controller = context.getClass();

    const entity = this.reflector.getAllAndOverride<string>('entity', [
      handler,
      controller,
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [handler, controller],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const standardActions = [
        'LIST',
        'DETAIL',
        'CREATE',
        'UPDATE',
        'DELETE',
        'SORT',
      ];

      const finalRequiredCodes = requiredPermissions.map((permission) => {
        const action = permission.toUpperCase();
        if (standardActions.includes(action) && entity) {
          return `${entity.toUpperCase()}_${action}`;
        }
        return action;
      });

      return finalRequiredCodes.every((code) => userPermissions.includes(code));
    }

    if (entity) {
      const actionMap: Record<string, string> = {
        findAll: 'LIST',
        findOne: 'DETAIL',
        create: 'CREATE',
        update: 'UPDATE',
        remove: 'DELETE',
        updateSort: 'SORT',
      };

      const action = actionMap[handler.name];
      if (action) {
        const fallbackCode = `${entity.toUpperCase()}_${action}`;
        return userPermissions.includes(fallbackCode);
      }

      return false;
    }

    return false;
  }
}
