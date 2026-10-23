/**
 * Số liệu trang tổng quan admin: sản phẩm, yêu cầu tư vấn, bài viết (+ 5 bài sửa gần nhất), trang, liên hệ (+ 5 liên hệ mới nhất), nhân viên.
 * Dùng bởi: dashboard.controller.ts.
 * Lưu ý: mỗi nhóm chỉ được đếm và trả về khi người xem có quyền LIST tương ứng (DASHBOARD_GROUP_PERMISSIONS), nên nhân viên
 * không có quyền liên hệ sẽ không thấy tên / email khách qua dashboard. Thiếu quyền thì nhóm đó vắng mặt trong JSON.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { BlogCategory } from '../blog-categories/entities/blog-category.entity';
import { BlogPost } from '../blog-posts/entities/blog-post.entity';
import { ContactEntity } from '../contact/entities/contact.entity';
import { PageSection } from '../pages/entities/page-section.entity';
import { Page } from '../pages/entities/page.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { Product } from '../products/entities/product.entity';
import {
  QuoteRequest,
  QuoteRequestStatus,
} from '../quote-requests/entities/quote-request.entity';
import { Staff } from '../staffs/staff.entity';

export const DASHBOARD_GROUP_PERMISSIONS = {
  catalog: 'PRODUCT_LIST',
  quoteRequests: 'QUOTE_REQUEST_LIST',
  blogPosts: 'BLOG_POST_LIST',
  pages: 'PAGE_LIST',
  contacts: 'CONTACT_LIST',
  staff: 'STAFF_LIST',
} as const;

const RECENT_ITEM_LIMIT = 5;

const startOfCurrentMonth = (): Date => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  return monthStart;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly blogPostRepo: Repository<BlogPost>,
    @InjectRepository(BlogCategory)
    private readonly blogCategoryRepo: Repository<BlogCategory>,
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(PageSection)
    private readonly pageSectionRepo: Repository<PageSection>,
    @InjectRepository(ContactEntity)
    private readonly contactRepo: Repository<ContactEntity>,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepo: Repository<ProductCategory>,
    @InjectRepository(QuoteRequest)
    private readonly quoteRequestRepo: Repository<QuoteRequest>,
  ) {}

  async getSummary(permissions: string[]) {
    const grantedPermissions = new Set(
      permissions.map((permission) => permission.toUpperCase()),
    );
    const canSee = (group: keyof typeof DASHBOARD_GROUP_PERMISSIONS) =>
      grantedPermissions.has(DASHBOARD_GROUP_PERMISSIONS[group]);

    const [catalog, quoteRequests, blogPosts, pages, contacts, staff] =
      await Promise.all([
        canSee('catalog') ? this.countCatalog() : undefined,
        canSee('quoteRequests') ? this.countQuoteRequests() : undefined,
        canSee('blogPosts') ? this.summarizeBlogPosts() : undefined,
        canSee('pages') ? this.countPages() : undefined,
        canSee('contacts') ? this.summarizeContacts() : undefined,
        canSee('staff') ? this.countStaff() : undefined,
      ]);

    return { catalog, quoteRequests, blogPosts, pages, contacts, staff };
  }

  private async countCatalog() {
    const [products, publishedProducts, featuredProducts, productCategories] =
      await Promise.all([
        this.productRepo.count(),
        this.productRepo.count({ where: { status: PublishStatus.PUBLISHED } }),
        this.productRepo.count({ where: { isFeatured: true } }),
        this.productCategoryRepo.count(),
      ]);
    return { products, publishedProducts, featuredProducts, productCategories };
  }

  private async countQuoteRequests() {
    const [total, newCount] = await Promise.all([
      this.quoteRequestRepo.count(),
      this.quoteRequestRepo.count({
        where: { status: QuoteRequestStatus.NEW },
      }),
    ]);
    return { total, new: newCount };
  }

  private async summarizeBlogPosts() {
    const [total, published, drafts, categories, recent] = await Promise.all([
      this.blogPostRepo.count(),
      this.blogPostRepo.count({ where: { status: PublishStatus.PUBLISHED } }),
      this.blogPostRepo.count({ where: { status: PublishStatus.DRAFT } }),
      this.blogCategoryRepo.count(),
      this.blogPostRepo.find({
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
        },
        order: { updatedAt: 'DESC' },
        take: RECENT_ITEM_LIMIT,
      }),
    ]);
    return { total, published, drafts, categories, recent };
  }

  private async countPages() {
    const [total, published, sections] = await Promise.all([
      this.pageRepo.count(),
      this.pageRepo.count({ where: { status: PublishStatus.PUBLISHED } }),
      this.pageSectionRepo.count(),
    ]);
    return { total, published, sections };
  }

  private async summarizeContacts() {
    const [total, thisMonth, recent] = await Promise.all([
      this.contactRepo.count(),
      this.contactRepo.count({
        where: { createdAt: MoreThanOrEqual(startOfCurrentMonth()) },
      }),
      this.contactRepo.find({
        select: {
          id: true,
          fullname: true,
          email: true,
          subject: true,
          createdAt: true,
        },
        order: { createdAt: 'DESC' },
        take: RECENT_ITEM_LIMIT,
      }),
    ]);
    return { total, thisMonth, recent };
  }

  private async countStaff() {
    const [total, active] = await Promise.all([
      this.staffRepo.count(),
      this.staffRepo.count({ where: { status: AccountStatus.ACTIVE } }),
    ]);
    return { total, active };
  }
}
