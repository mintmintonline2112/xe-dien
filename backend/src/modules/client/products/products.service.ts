/**
 * Đọc sản phẩm và danh mục sản phẩm cho website: danh sách lọc / sắp xếp / phân trang, chi tiết theo slug, danh mục kèm số sản phẩm.
 * Dùng bởi: modules/client/products (products.controller.ts, product-categories.controller.ts).
 * Lưu ý: chỉ sản phẩm `published` có publishedAt ≤ hiện tại hoặc để trống. Lọc theo danh mục gồm cả danh mục con.
 * Danh sách không trả cột `content` (bài mô tả dài) cho nhẹ; sắp theo giá luôn đẩy sản phẩm "Liên hệ" (price null) xuống cuối.
 * Danh mục trả dạng phẳng theo thứ tự: mỗi danh mục gốc rồi tới các con của nó (con có cha bị ẩn thì đứng như gốc).
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { applyTranslations, type Lang } from 'src/common/i18n/translations';
import { Product } from 'src/modules/admin/products/entities/product.entity';
import { ProductCategory } from 'src/modules/admin/product-categories/entities/product-category.entity';

export const PRODUCT_SORTS = [
  'featured',
  'newest',
  'price_asc',
  'price_desc',
  'name',
] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export type ProductListQuery = {
  page: number;
  limit: number;
  categorySlug?: string;
  isFeaturedOnly: boolean;
  search?: string;
  brand?: string;
  excludeId?: number;
  sort: ProductSort;
  lang: Lang;
};

export type ProductCategoryWithCount = ProductCategory & {
  productCount: number;
};

const LIST_ITEM_COLUMNS = [
  'id',
  'sortOrder',
  'createdAt',
  'updatedAt',
  'title',
  'slug',
  'status',
  'categoryId',
  'sku',
  'brand',
  'price',
  'originalPrice',
  'badge',
  'stockStatus',
  'isFeatured',
  'excerpt',
  'thumbnailPath',
  'gallery',
  'specs',
  'highlights',
  'promotion',
  'warranty',
  'publishedAt',
  'metaTitle',
  'metaDescription',
  'ogImagePath',
  'canonicalUrl',
  'translations',
  'metadata',
] as const;

@Injectable()
export class ClientProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
  ) {}

  static localizeCategory<T extends ProductCategory | null | undefined>(
    category: T,
    lang: Lang,
  ): T {
    if (!category) return category;
    const localized = applyTranslations(category, lang);
    return {
      ...localized,
      parent: category.parent
        ? applyTranslations(category.parent, lang)
        : category.parent,
      children: category.children?.map((child) =>
        applyTranslations(child, lang),
      ),
    } as T;
  }

  static localizeProduct<T extends Product | null>(product: T, lang: Lang): T {
    if (!product) return product;
    return {
      ...applyTranslations(product, lang),
      category: ClientProductsService.localizeCategory(product.category, lang),
    } as T;
  }

  private wherePublished(
    queryBuilder: SelectQueryBuilder<Product>,
  ): SelectQueryBuilder<Product> {
    return queryBuilder
      .andWhere('product.status = :status', { status: PublishStatus.PUBLISHED })
      .andWhere(
        new Brackets((publishedClause) => {
          publishedClause
            .where('product.publishedAt IS NULL')
            .orWhere('product.publishedAt <= :now', { now: new Date() });
        }),
      );
  }

  private applySort(
    queryBuilder: SelectQueryBuilder<Product>,
    sort: ProductSort,
  ): void {
    if (sort === 'price_asc' || sort === 'price_desc') {
      queryBuilder
        .addSelect(
          'CASE WHEN product.price IS NULL THEN 1 ELSE 0 END',
          'price_missing',
        )
        .orderBy('price_missing', 'ASC')
        .addOrderBy('product.price', sort === 'price_asc' ? 'ASC' : 'DESC')
        .addOrderBy('product.id', 'DESC');
      return;
    }
    if (sort === 'newest') {
      queryBuilder
        .addSelect(
          'COALESCE(product.published_at, product.created_at)',
          'published_sort',
        )
        .orderBy('published_sort', 'DESC')
        .addOrderBy('product.id', 'DESC');
      return;
    }
    if (sort === 'name') {
      queryBuilder
        .orderBy('product.title', 'ASC')
        .addOrderBy('product.id', 'ASC');
      return;
    }
    queryBuilder
      .orderBy('product.isFeatured', 'DESC')
      .addOrderBy('product.sortOrder', 'ASC')
      .addOrderBy('product.publishedAt', 'DESC')
      .addOrderBy('product.id', 'DESC');
  }

  private async findCategoryIdsWithChildren(slug: string): Promise<number[]> {
    const category = await this.categoryRepo.findOne({
      where: { slug, isActive: true },
      select: ['id'],
    });
    if (!category) return [];
    const children = await this.categoryRepo.find({
      where: { parentId: category.id },
      select: ['id'],
    });
    return [category.id, ...children.map((child) => child.id)];
  }

  async findPublishedPage(query: ProductListQuery) {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .select(LIST_ITEM_COLUMNS.map((column) => `product.${column}`))
      .leftJoin('product.category', 'category')
      .addSelect(['category.id', 'category.name', 'category.slug', 'category.parentId', 'category.translations']);

    this.wherePublished(queryBuilder);

    if (query.categorySlug) {
      const categoryIds = await this.findCategoryIdsWithChildren(
        query.categorySlug,
      );
      if (categoryIds.length === 0) {
        return {
          data: [],
          meta: { total: 0, page: query.page, limit: query.limit, totalPages: 0 },
        };
      }
      queryBuilder.andWhere('product.categoryId IN (:...categoryIds)', {
        categoryIds,
      });
    }
    if (query.isFeaturedOnly) {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', {
        isFeatured: true,
      });
    }
    if (query.search) {
      const pattern = `%${query.search}%`;
      queryBuilder.andWhere(
        new Brackets((searchClause) => {
          searchClause
            .where('product.title LIKE :pattern', { pattern })
            .orWhere('product.brand LIKE :pattern', { pattern })
            .orWhere('product.sku LIKE :pattern', { pattern });
        }),
      );
    }
    if (query.brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand: query.brand });
    }
    if (query.excludeId) {
      queryBuilder.andWhere('product.id != :excludeId', {
        excludeId: query.excludeId,
      });
    }

    this.applySort(queryBuilder, query.sort);

    const [products, total] = await queryBuilder
      .offset((query.page - 1) * query.limit)
      .limit(query.limit)
      .getManyAndCount();

    return {
      data: products.map((product) =>
        ClientProductsService.localizeProduct(product, query.lang),
      ),
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findPublishedBySlug(slug: string, lang: Lang): Promise<Product | null> {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'parent')
      .where('product.slug = :slug', { slug });
    this.wherePublished(queryBuilder);
    const product = await queryBuilder.getOne();
    return ClientProductsService.localizeProduct(product, lang);
  }

  private async countPublishedByCategory(): Promise<Map<number, number>> {
    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .select('product.categoryId', 'categoryId')
      .addSelect('COUNT(product.id)', 'productCount')
      .where('product.categoryId IS NOT NULL')
      .groupBy('product.categoryId');
    this.wherePublished(queryBuilder);
    const rows = await queryBuilder.getRawMany<{
      categoryId: number | string;
      productCount: number | string;
    }>();
    return new Map(
      rows.map((row) => [Number(row.categoryId), Number(row.productCount)]),
    );
  }

  async findActiveCategories(lang: Lang): Promise<ProductCategoryWithCount[]> {
    const [categories, countByCategory] = await Promise.all([
      this.categoryRepo.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC', id: 'ASC' },
      }),
      this.countPublishedByCategory(),
    ]);

    const countWithChildren = (category: ProductCategory): number =>
      (countByCategory.get(category.id) ?? 0) +
      categories
        .filter((child) => child.parentId === category.id)
        .reduce((sum, child) => sum + (countByCategory.get(child.id) ?? 0), 0);

    const roots = categories.filter(
      (category) =>
        category.parentId == null ||
        !categories.some((parent) => parent.id === category.parentId),
    );
    const rootsFollowedByChildren = roots.flatMap((root) => [
      root,
      ...categories.filter((child) => child.parentId === root.id),
    ]);

    return rootsFollowedByChildren.map((category) => ({
      ...applyTranslations(category, lang),
      productCount: countWithChildren(category),
    })) as ProductCategoryWithCount[];
  }

  async findActiveCategoryBySlug(
    slug: string,
    lang: Lang,
  ): Promise<ProductCategory | null> {
    const category = await this.categoryRepo.findOne({
      where: { slug, isActive: true },
      relations: { parent: true },
    });
    if (!category) return null;
    category.children = await this.categoryRepo.find({
      where: { parentId: category.id, isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return ClientProductsService.localizeCategory(category, lang);
  }
}
