/**
 * Tạo service CRUD cho endpoint kế thừa BaseController của backend (GET /, GET /:id, POST, PUT /:id, DELETE /:id, PATCH sort/:id), nhận JSON hoặc FormData.
 * Dùng bởi: các *.service.ts và *Form.tsx trong app/admin/(protected) (buildPayload).
 * Lưu ý: buildPayload bỏ chuỗi rỗng / undefined, chỉ giữ null với key trong `keepNull`; có File thì gửi FormData kèm imageOptimize=skip
 * (ảnh đã qua hộp thoại nén nên backend không nén lại).
 */
import { adminApi, adminApiFetch } from './admin-api';
import type { PaginatedResponse } from './pagination';

export type CrudPayload = Record<string, unknown> | FormData;

export function createCrudService<T>(
  endpoint: string,
  defaultOrderBy: Array<Record<string, 'ASC' | 'DESC'>> = [{ createdAt: 'DESC' }],
) {
  function sendPayload<R>(method: 'POST' | 'PUT', path: string, payload: CrudPayload): Promise<R> {
    if (payload instanceof FormData) {
      return adminApiFetch<R>(path, { method, body: payload });
    }
    return adminApiFetch<R>(path, { method, body: JSON.stringify(payload) });
  }

  return {
    paginate(params: Record<string, unknown>): Promise<PaginatedResponse<T>> {
      const query = new URLSearchParams();
      const merged = { orderBy: JSON.stringify(defaultOrderBy), ...params };
      for (const [key, value] of Object.entries(merged)) {
        if (value === undefined || value === null || value === '') continue;
        query.set(key, String(value));
      }
      return adminApi.get<PaginatedResponse<T>>(`${endpoint}?${query.toString()}`);
    },

    getById(id: number | string): Promise<T> {
      return adminApi.get<T>(`${endpoint}/${id}`);
    },

    add(payload: CrudPayload): Promise<T> {
      return sendPayload<T>('POST', endpoint, payload);
    },

    edit(id: number | string, payload: CrudPayload): Promise<T> {
      return sendPayload<T>('PUT', `${endpoint}/${id}`, payload);
    },

    remove(id: number | string): Promise<{ id: number | string }> {
      return adminApi.delete<{ id: number | string }>(`${endpoint}/${id}`);
    },

    sort(id: number | string, sortValue: number): Promise<T> {
      return adminApi.patch<T>(`${endpoint}/sort/${id}`, { sort: sortValue });
    },
  };
}

export function buildPayload(
  values: Record<string, unknown>,
  options: { keepNull?: string[] } = {},
): CrudPayload {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === '') continue;
    if (value === null && !options.keepNull?.includes(key)) continue;
    payload[key] = value;
  }

  const hasFile = Object.values(payload).some((value) => value instanceof File);
  if (!hasFile) return payload;

  const formData = new FormData();
  formData.append('imageOptimize', 'skip');
  for (const [key, value] of Object.entries(payload)) {
    if (value instanceof File) formData.append(key, value);
    else if (value === null) continue;
    else if (typeof value === 'object') formData.append(key, JSON.stringify(value));
    else formData.append(key, String(value));
  }
  return formData;
}
