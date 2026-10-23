/**
 * Kiểu dữ liệu số liệu tổng quan trả về từ API admin/dashboard.
 * Dùng bởi: DashboardScreen.
 * Lưu ý: mọi nhóm đều tuỳ chọn — backend chỉ trả nhóm mà người xem có quyền LIST tương ứng (xem dashboard.service.ts).
 */

export interface DashboardPost {
  id: number;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
}

export interface DashboardContact {
  id: number;
  fullname: string | null;
  email: string | null;
  subject: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  catalog?: {
    products: number;
    publishedProducts: number;
    featuredProducts: number;
    productCategories: number;
  };
  quoteRequests?: {
    total: number;
    new: number;
  };
  blogPosts?: {
    total: number;
    published: number;
    drafts: number;
    categories: number;
    recent: DashboardPost[];
  };
  pages?: {
    total: number;
    published: number;
    sections: number;
  };
  contacts?: {
    total: number;
    thisMonth: number;
    recent: DashboardContact[];
  };
  staff?: {
    total: number;
    active: number;
  };
}
