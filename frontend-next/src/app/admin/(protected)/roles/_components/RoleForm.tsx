'use client';

/**
 * Form tạo / sửa vai trò: tên, mô tả và lưới chọn quyền gộp theo module (mỗi module có nút chọn / bỏ cả nhóm).
 * Dùng bởi: roles/create/page.tsx, roles/edit/[id]/page.tsx.
 * Lưu ý: không dùng GenericForm vì phần chọn quyền là lưới checkbox đặc thù. Vai trò tên ADMIN là vai trò hệ thống:
 * form khoá hết, backend không cho sửa / xoá.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import {
  permissionService,
  PERMISSION_QUERY_KEY,
  type Permission,
} from '@/app/admin/(protected)/permissions/_lib/permission.service';
import { permissionModuleLabelOf } from '@/app/admin/(protected)/permissions/_lib/permission-modules';
import { roleService, ROLE_QUERY_KEY } from '@/app/admin/(protected)/roles/_lib/role.service';
import { adminRoutes } from '@/config/routes';

export function RoleForm({ id }: { id?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { data: permissions } = useQuery({
    queryKey: [...PERMISSION_QUERY_KEY, 'options'],
    queryFn: () => permissionService.paginate({ limit: 1000 }),
  });

  const { data: role } = useQuery({
    queryKey: [...ROLE_QUERY_KEY, 'detail', id],
    queryFn: () => roleService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (role) {
      setName(role.name ?? '');
      setDescription(role.description ?? '');
      setSelectedIds(new Set((role.permissions ?? []).map((permission) => permission.id)));
    }
  }, [role]);

  const permissionsByModule = useMemo(() => {
    const groups = new Map<string, Permission[]>();
    for (const permission of permissions?.data ?? []) {
      const moduleName = permission.module ? permissionModuleLabelOf(permission.module) : 'Khác';
      if (!groups.has(moduleName)) groups.set(moduleName, []);
      groups.get(moduleName)!.push(permission);
    }
    return Array.from(groups.entries()).sort(([moduleA], [moduleB]) => moduleA.localeCompare(moduleB));
  }, [permissions]);

  const isAdminRole = role?.name?.toUpperCase() === 'ADMIN';

  function togglePermission(permissionId: number) {
    setSelectedIds((currentIds) => {
      const next = new Set(currentIds);
      if (next.has(permissionId)) next.delete(permissionId);
      else next.add(permissionId);
      return next;
    });
  }

  function toggleModule(modulePermissions: Permission[]) {
    setSelectedIds((currentIds) => {
      const next = new Set(currentIds);
      const isAllSelected = modulePermissions.every((permission) => next.has(permission.id));
      for (const permission of modulePermissions) {
        if (isAllSelected) next.delete(permission.id);
        else next.add(permission.id);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Tên vai trò không được để trống');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        permissions: Array.from(selectedIds),
      };

      if (isEdit) await roleService.edit(id!, payload);
      else await roleService.add(payload);

      await queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật vai trò' : 'Đã tạo vai trò');
      router.push(adminRoutes.roles.list);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="gf-header">
        <button
          type="button"
          onClick={() => router.push(adminRoutes.roles.list)}
          className="gf-back"
          aria-label="Quay lại"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="adm-page-title">{isEdit ? 'Sửa vai trò' : 'Tạo vai trò'}</h1>
          <p className="adm-page-subtitle">
            {isEdit ? 'Cập nhật nhóm quyền quản trị' : 'Thêm nhóm quyền quản trị mới'}
          </p>
          <nav className="gf-breadcrumbs">
            <span>
              <Link href={adminRoutes.roles.list}>Vai trò</Link>
              <span style={{ margin: '0 4px' }}>/</span>
            </span>
            <span>{isEdit ? 'Sửa' : 'Tạo mới'}</span>
          </nav>
        </div>
      </div>

      {isAdminRole && (
        <p className="rl-admin-note">
          Vai trò Admin là vai trò hệ thống — backend không cho phép sửa hoặc xóa.
        </p>
      )}

      <div className="gf-card">
        <div>
          <label className="gf-label">
            Tên vai trò<span className="gf-required">*</span>
          </label>
          <input
            className="gf-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Biên tập viên"
            disabled={isAdminRole}
          />
        </div>
        <div>
          <label className="gf-label">Mô tả</label>
          <textarea
            className="gf-control"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Phạm vi của vai trò này"
            disabled={isAdminRole}
          />
        </div>

        <div>
          <label className="gf-label">
            Quyền truy cập ({selectedIds.size} đã chọn)
          </label>
          <div className="rl-modules">
            {permissionsByModule.map(([module, modulePermissions]) => {
              const isAllSelected = modulePermissions.every((permission) => selectedIds.has(permission.id));
              return (
                <div key={module} className="rl-module">
                  <div className="rl-module-head">
                    <strong>{module}</strong>
                    <button
                      type="button"
                      className="rl-module-toggle"
                      onClick={() => toggleModule(modulePermissions)}
                      disabled={isAdminRole}
                    >
                      {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                  <div className="rl-perms">
                    {modulePermissions.map((permission) => (
                      <label key={permission.id} className="rl-perm" title={permission.code}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          disabled={isAdminRole}
                        />
                        <span>{permission.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!isAdminRole && (
        <div className="gf-actions">
          <button type="button" onClick={() => router.push(adminRoutes.roles.list)} className="adm-btn">
            Hủy
          </button>
          <button type="submit" disabled={isSubmitting} className="adm-btn adm-btn--primary">
            {isSubmitting && <span className="adm-spin" />}
            {isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      )}
    </form>
  );
}
