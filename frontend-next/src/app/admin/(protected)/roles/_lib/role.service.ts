/**
 * Gọi API CRUD vai trò và kiểu dữ liệu Role cho admin.
 * Dùng bởi: RoleForm, RoleList, StaffForm.
 */

import { createCrudService } from '@/app/admin/_lib/crud-service';

export const ROLE_QUERY_KEY = ['admin', 'roles'] as const;

export interface RolePermission {
  id: number;
  name: string;
  code: string;
  module: string;
}

export interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions?: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export const roleService = createCrudService<Role>('admin/roles');
