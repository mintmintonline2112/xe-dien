/**
 * Lưu danh mục blog, tự sinh slug không trùng khi tạo và khi sửa slug.
 * Dùng bởi: blog-categories.controller.ts.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { generateUniqueSlug } from 'src/common/helpers/slug.helper';
import { BlogCategory } from './entities/blog-category.entity';

@Injectable()
export class BlogCategoriesService extends BaseService<BlogCategory, number> {
  constructor(
    @InjectRepository(BlogCategory)
    private readonly categoryRepo: Repository<BlogCategory>,
  ) {
    super(categoryRepo);
  }

  override async create(
    data: DeepPartial<BlogCategory>,
  ): Promise<BlogCategory> {
    const slug = await generateUniqueSlug(
      this.categoryRepo,
      data.slug || data.name,
    );
    return super.create({ ...data, slug });
  }

  override async update(
    id: number,
    data: DeepPartial<BlogCategory>,
    manager?: EntityManager,
  ): Promise<BlogCategory> {
    if (data.slug !== undefined) {
      const existing = await this.categoryRepo.findOne({ where: { id } });
      const slugSource = data.slug || data.name || existing?.name || '';
      data = {
        ...data,
        slug: await generateUniqueSlug(this.categoryRepo, slugSource, {
          excludeId: id,
        }),
      };
    }
    return super.update(id, data, manager);
  }
}
