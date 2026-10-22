/**
 * Hàm dựng và so khớp đường dẫn: joinPath, withHash, withQuery, createCrudRoutes (list / create / edit/[id]), isActivePath.
 * Dùng bởi: config/routes.ts, app/admin/_layout (navigation.ts, AdminSidebar.tsx), app/(site)/_components/layout/Header.tsx.
 * Lưu ý: trang chủ chỉ active khi khớp đúng "/" và href không có neo; còn lại khớp chính xác hoặc là trang con.
 */
export type RouteId = number | string;

export function joinPath(...segments: Array<string | number>): string {
  const joined = segments
    .map((segment) => String(segment).trim())
    .filter(Boolean)
    .map((segment) => segment.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
  return `/${joined}`;
}

export function withHash(path: string, anchor: string): string {
  return anchor ? `${path}#${anchor.replace(/^#/, '')}` : path;
}

export function withQuery(
  path: string,
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    searchParams.set(key, String(value));
  }
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

export interface CrudRoutes {
  readonly list: string;
  readonly create: string;
  readonly edit: (id: RouteId) => string;
}

export function createCrudRoutes(basePath: string, segment: string): CrudRoutes {
  const list = joinPath(basePath, segment);
  return {
    list,
    create: joinPath(list, 'create'),
    edit: (id: RouteId) => joinPath(list, 'edit', id),
  };
}

export function isActivePath(pathname: string, href: string, home = '/'): boolean {
  const hrefPath = href.split(/[#?]/)[0] || home;
  if (hrefPath === home) return pathname === home && !href.includes('#');
  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}
