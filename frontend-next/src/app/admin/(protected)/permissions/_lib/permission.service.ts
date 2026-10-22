/**
 * Gọi API danh sách quyền và kiểu dữ liệu Permission cho admin.
 * Dùng bởi: PermissionList, RoleForm.
 */

import { createCrudService } from '@/app/admin/_lib/crud-service';

export const PERMISSION_QUERY_KEY = ['admin', 'permissions'] as const;

export interface Permission {
  id: number;
  name: string;
  code: string;
  module: string;
  description: string | null;
}

export const permissionService = createCrudService<Permission>('admin/permissions', [
  { module: 'ASC' },
  { code: 'ASC' },
]);
