/**
 * API CRUD sản phẩm cho admin (/admin/products), nhận ảnh đại diện upload ở field thumbnailPath, ghi xong thì xoá cache sản phẩm.
 * Dùng bởi: frontend-next app/admin/(protected)/products/_lib/product.service.ts.
 * Lưu ý: imageOptimize = 'skip' nghĩa là admin đã nén ảnh trên trình duyệt, server không nén lại.
 */
import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  SetMetadata,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { FindManyOptions, FindOneOptions } from 'typeorm';
import { BaseController } from 'src/common/base/base.controller';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import {
  CACHE_NAMESPACES_KEY,
  InvalidateCacheInterceptor,
} from 'src/common/interceptors/invalidate-cache.interceptor';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

const UPLOAD_FOLDER = 'products';

@ApiTags('Admin - Products')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@UseInterceptors(InvalidateCacheInterceptor)
@SetMetadata('entity', 'PRODUCT')
@SetMetadata(CACHE_NAMESPACES_KEY, [CACHE_NS.products])
@Controller('admin/products')
export class ProductsController extends BaseController<
  Product,
  CreateProductDto,
  UpdateProductDto,
  number
> {
  constructor(private readonly productsService: ProductsService) {
    super(productsService, 'Product');
  }

  protected override getFindAllOptions(): FindManyOptions<Product> {
    return { relations: { category: true } };
  }

  protected override getFindOneOptions(id: number): FindOneOptions<Product> {
    return { where: { id: Number(id) }, relations: { category: true } };
  }

  protected override getFilterableFields(): (keyof Product)[] {
    return ['status', 'categoryId', 'isFeatured', 'stockStatus'];
  }

  protected override getSearchFields(): (keyof Product)[] {
    return ['title', 'sku', 'brand'];
  }

  @Post()
  @Permissions('CREATE')
  @UseInterceptors(FileInterceptor('thumbnailPath'))
  @ApiBody({ type: CreateProductDto })
  override async create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
    @Body('imageOptimize') imageOptimize?: string,
  ) {
    if (file) dto.thumbnailPath = file;
    return this.productsService.createProduct(dto, UPLOAD_FOLDER, {
      skipOptimize: imageOptimize === 'skip',
    });
  }

  @Put(':id')
  @Permissions('UPDATE')
  @UseInterceptors(FileInterceptor('thumbnailPath'))
  @ApiBody({ type: UpdateProductDto })
  override async update(
    @Param('id') id: number,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
    @Body('imageOptimize') imageOptimize?: string,
  ) {
    if (file) dto.thumbnailPath = file;
    return this.productsService.updateProduct(Number(id), dto, UPLOAD_FOLDER, {
      skipOptimize: imageOptimize === 'skip',
    });
  }
}
