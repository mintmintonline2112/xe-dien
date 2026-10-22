/**
 * API CRUD danh mục sản phẩm cho admin (/admin/product-categories), ghi xong thì xoá cache sản phẩm của site.
 * Dùng bởi: frontend-next app/admin/(protected)/product-categories/_lib/product-category.service.ts.
 */
import {
  Controller,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/base/base.controller';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import {
  CACHE_NAMESPACES_KEY,
  InvalidateCacheInterceptor,
} from 'src/common/interceptors/invalidate-cache.interceptor';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ProductCategoriesService } from './product-categories.service';

@ApiTags('Admin - Product Categories')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@UseInterceptors(InvalidateCacheInterceptor)
@SetMetadata('entity', 'PRODUCT_CATEGORY')
@SetMetadata(CACHE_NAMESPACES_KEY, [CACHE_NS.products])
@Controller('admin/product-categories')
export class ProductCategoriesController extends BaseController<
  ProductCategory,
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
  number
> {
  constructor(private readonly categoriesService: ProductCategoriesService) {
    super(categoriesService, 'ProductCategory');
  }

  protected override getFilterableFields(): (keyof ProductCategory)[] {
    return ['isActive', 'parentId'];
  }

  protected override getSearchFields(): (keyof ProductCategory)[] {
    return ['name'];
  }
}
