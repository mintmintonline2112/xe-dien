/**
 * Đếm sản phẩm, danh mục sản phẩm, yêu cầu tư vấn, bài viết, trang, liên hệ, nhân viên và lấy 5 bài sửa gần nhất, 5 liên hệ mới nhất cho trang tổng quan.
 * Dùng bởi: dashboard.controller.ts.
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

  async getSummary() {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      blogPostCount,
      publishedBlogPostCount,
      draftBlogPostCount,
      categoryCount,
      pageCount,
      publishedPageCount,
      sectionCount,
      contactCount,
      contactCountThisMonth,
      staffCount,
      activeStaffCount,
      recentPosts,
      recentContacts,
      productCount,
      publishedProductCount,
      featuredProductCount,
      productCategoryCount,
      quoteRequestCount,
      newQuoteRequestCount,
    ] = await Promise.all([
      this.blogPostRepo.count(),
      this.blogPostRepo.count({ where: { status: PublishStatus.PUBLISHED } }),
      this.blogPostRepo.count({ where: { status: PublishStatus.DRAFT } }),
      this.blogCategoryRepo.count(),
      this.pageRepo.count(),
      this.pageRepo.count({ where: { status: PublishStatus.PUBLISHED } }),
      this.pageSectionRepo.count(),
      this.contactRepo.count(),
      this.contactRepo.count({
        where: { createdAt: MoreThanOrEqual(monthStart) },
      }),
      this.staffRepo.count(),
      this.staffRepo.count({ where: { status: AccountStatus.ACTIVE } }),
      this.blogPostRepo.find({
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
        },
        order: { updatedAt: 'DESC' },
        take: 5,
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
        take: 5,
      }),
      this.productRepo.count(),
      this.productRepo.count({ where: { status: PublishStatus.PUBLISHED } }),
      this.productRepo.count({ where: { isFeatured: true } }),
      this.productCategoryRepo.count(),
      this.quoteRequestRepo.count(),
      this.quoteRequestRepo.count({
        where: { status: QuoteRequestStatus.NEW },
      }),
    ]);

    return {
      catalog: {
        products: productCount,
        publishedProducts: publishedProductCount,
        featuredProducts: featuredProductCount,
        productCategories: productCategoryCount,
      },
      quoteRequests: { total: quoteRequestCount, new: newQuoteRequestCount },
      content: {
        blogPosts: blogPostCount,
        publishedBlogPosts: publishedBlogPostCount,
        draftBlogPosts: draftBlogPostCount,
        categories: categoryCount,
        pages: pageCount,
        publishedPages: publishedPageCount,
        sections: sectionCount,
      },
      contacts: { total: contactCount, thisMonth: contactCountThisMonth },
      staff: { total: staffCount, active: activeStaffCount },
      recentPosts,
      recentContacts,
    };
  }
}
