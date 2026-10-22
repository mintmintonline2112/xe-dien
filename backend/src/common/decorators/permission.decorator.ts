/**
 * Decorator @Permissions(...) gắn danh sách quyền cần có cho route admin.
 * Dùng bởi: common/base/base.controller.ts và các controller trong modules/admin; PermissionGuard đọc metadata này.
 */
import { SetMetadata } from '@nestjs/common';

export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
