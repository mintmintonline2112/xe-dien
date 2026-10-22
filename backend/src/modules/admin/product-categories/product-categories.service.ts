/**
 * Lưu danh mục sản phẩm: tự sinh slug không trùng khi tạo / sửa slug, chặn đặt danh mục làm cha của chính nó.
 * Dùng bởi: product-categories.controller.ts.
 */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { generateUniqueSlug } from 'src/common/helpers/slug.helper';
import { ProductCategory } from './entities/product-category.entity';

@Injectable()
export class ProductCategoriesService extends BaseService<
  ProductCategory,
  number
> {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
  ) {
    super(categoryRepo);
  }

  override async create(
    data: DeepPartial<ProductCategory>,
  ): Promise<ProductCategory> {
    const slug = await generateUniqueSlug(
      this.categoryRepo,
      data.slug || data.name || '',
      { fallback: 'danh-muc' },
    );
    return super.create({ ...data, slug });
  }

  override async update(
    id: number,
    data: DeepPartial<ProductCategory>,
    manager?: EntityManager,
  ): Promise<ProductCategory> {
    if (data.parentId != null && Number(data.parentId) === Number(id)) {
      throw new BadRequestException('Danh mục không thể là cha của chính nó');
    }
    if (data.slug !== undefined) {
      const existing = await this.categoryRepo.findOne({ where: { id } });
      const slugSource = data.slug || data.name || existing?.name || '';
      data = {
        ...data,
        slug: await generateUniqueSlug(this.categoryRepo, slugSource, {
          excludeId: id,
          fallback: 'danh-muc',
        }),
      };
    }
    return super.update(id, data, manager);
  }
}
