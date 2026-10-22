/**
 * Đọc bài blog và danh mục cho website, gộp bản dịch cho bài và danh mục kèm theo; kế thừa BaseService để phân trang.
 * Dùng bởi: modules/client/blog-posts (blog-posts.controller.ts, blog-categories.controller.ts).
 * Lưu ý: danh mục ra public dùng `displayName` (nếu có) thay `name` — `name` là tên nội bộ để admin phân biệt.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { applyTranslations, type Lang } from 'src/common/i18n/translations';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';
import { BlogCategory } from 'src/modules/admin/blog-categories/entities/blog-category.entity';

@Injectable()
export class ClientBlogPostsService extends BaseService<BlogPost, number> {
  constructor(
    @InjectRepository(BlogPost)
    protected readonly postRepo: Repository<BlogPost>,
    @InjectRepository(BlogCategory)
    private readonly categoryRepo: Repository<BlogCategory>,
  ) {
    super(postRepo);
  }

  static toPublicCategory<T extends BlogCategory | null>(
    category: T,
    lang: Lang,
  ): T {
    if (!category) return category;
    const displayName = category.displayName?.trim();
    const categoryWithPublicName = displayName
      ? ({ ...category, name: displayName } as T)
      : category;
    return applyTranslations(categoryWithPublicName, lang);
  }

  static localizePost<T extends BlogPost | null>(post: T, lang: Lang): T {
    if (!post) return post;
    const localized = applyTranslations(post, lang);
    return {
      ...localized,
      category: ClientBlogPostsService.toPublicCategory(post.category, lang),
    } as T;
  }

  async findActiveCategories(lang: Lang = 'vi'): Promise<BlogCategory[]> {
    const categories = await this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
      select: [
        'id',
        'name',
        'displayName',
        'slug',
        'parentId',
        'sortOrder',
        'translations',
      ],
    });
    return categories.map((category) =>
      ClientBlogPostsService.toPublicCategory(category, lang),
    );
  }

  async findPublishedBySlug(
    slug: string,
    lang: Lang = 'vi',
  ): Promise<BlogPost | null> {
    const post = await this.postRepo.findOne({
      where: {
        slug,
        status: PublishStatus.PUBLISHED,
        publishedAt: LessThanOrEqual(new Date()),
      },
      relations: { category: true },
    });
    return ClientBlogPostsService.localizePost(post, lang);
  }
}
