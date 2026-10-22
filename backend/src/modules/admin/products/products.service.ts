/**
 * Tạo / sửa sản phẩm: upload ảnh đại diện nếu có file mới, sinh slug không trùng, xoá ảnh khi admin gửi null.
 * Dùng bởi: products.controller.ts.
 * Lưu ý: ảnh chọn từ Thư viện đến dạng chuỗi đường dẫn (uploads/... hoặc /images/...), giữ nguyên không upload lại.
 */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { UploadImageService } from 'src/modules/upload-image/upload-image.service';
import { generateUniqueSlug } from 'src/common/helpers/slug.helper';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

type UploadOptions = { skipOptimize?: boolean };

const isUploadedFile = (value: unknown): value is Express.Multer.File =>
  !!value && typeof value === 'object' && 'buffer' in value;

@Injectable()
export class ProductsService extends BaseService<Product, number> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly uploadImageService: UploadImageService,
  ) {
    super(productRepo);
  }

  private async resolveThumbnail(
    value: unknown,
    folder: string,
    options: UploadOptions,
  ): Promise<string | null | undefined> {
    if (isUploadedFile(value)) {
      return this.uploadImageService.upload(value, folder, options);
    }
    if (value === undefined) return undefined;
    if (typeof value === 'string' && value.trim()) return value.trim();
    return null;
  }

  async createProduct(
    dto: CreateProductDto,
    folder: string,
    options: UploadOptions = {},
  ): Promise<Product> {
    const thumbnailPath = await this.resolveThumbnail(
      dto.thumbnailPath,
      folder,
      options,
    );
    const slug = await generateUniqueSlug(
      this.productRepo,
      dto.slug || dto.title,
      { fallback: 'san-pham' },
    );
    const entity: DeepPartial<Product> = {
      ...dto,
      thumbnailPath: thumbnailPath ?? null,
      slug,
    };
    return this.productRepo.save(this.productRepo.create(entity));
  }

  async updateProduct(
    id: number,
    dto: UpdateProductDto,
    folder: string,
    options: UploadOptions = {},
  ): Promise<Product> {
    const existing = await this.productRepo.findOneBy({ id });
    if (!existing) throw new BadRequestException('Không tìm thấy sản phẩm');

    const resolvedThumbnail = await this.resolveThumbnail(
      dto.thumbnailPath,
      folder,
      options,
    );
    const thumbnailPath =
      resolvedThumbnail === undefined
        ? existing.thumbnailPath
        : resolvedThumbnail;

    let slug = existing.slug;
    if (dto.slug !== undefined) {
      slug = await generateUniqueSlug(
        this.productRepo,
        dto.slug || dto.title || existing.title,
        { excludeId: id, fallback: 'san-pham' },
      );
    }

    return this.productRepo.save({
      ...existing,
      ...dto,
      thumbnailPath,
      slug,
    } as DeepPartial<Product>);
  }
}
