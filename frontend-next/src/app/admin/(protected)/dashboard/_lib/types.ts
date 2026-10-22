/**
 * Kiểu dữ liệu số liệu tổng quan trả về từ API admin/dashboard.
 * Dùng bởi: DashboardScreen.
 * Lưu ý: catalog / quoteRequests để tuỳ chọn — backend cũ chưa trả thì màn hình bỏ qua hai thẻ đó.
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
  content: {
    blogPosts: number;
    publishedBlogPosts: number;
    draftBlogPosts: number;
    categories: number;
    pages: number;
    publishedPages: number;
    sections: number;
  };
  contacts: {
    total: number;
    thisMonth: number;
  };
  staff: {
    total: number;
    active: number;
  };
  recentPosts: DashboardPost[];
  recentContacts: DashboardContact[];
}
