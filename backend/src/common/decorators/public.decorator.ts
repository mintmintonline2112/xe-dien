/**
 * Decorator @Public() đánh dấu route không cần đăng nhập.
 * Dùng bởi: JwtAdminAuthGuard, PermissionGuard (đọc IS_PUBLIC_KEY), controller client và các route công khai của admin.
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
