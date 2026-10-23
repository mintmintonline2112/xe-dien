/**
 * API admin CRUD mục menu (/admin/menu-items); ghi xong thì xoá cache menu.
 * Dùng bởi: menu-items.module.ts; trang admin frontend-next/src/app/admin/(protected)/menus.
 * Lưu ý: entity + mã quyền ở @Permissions được database/seeding/seeds/permission.seed.ts đọc để sinh quyền; đổi là đổi quyền.
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
import { MenuItem } from './menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuItemsService } from './menu-items.service';

@ApiTags('Admin - Menu Items')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@UseInterceptors(InvalidateCacheInterceptor)
@SetMetadata('entity', 'MENU_ITEM')
@SetMetadata(CACHE_NAMESPACES_KEY, [CACHE_NS.menu])
@Controller('admin/menu-items')
export class MenuItemsController extends BaseController<
  MenuItem,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  number
> {
  constructor(private readonly menuItemsService: MenuItemsService) {
    super(menuItemsService, 'MenuItem', {
      create: CreateMenuItemDto,
      update: UpdateMenuItemDto,
    });
  }

  protected getFilterableFields(): (keyof MenuItem)[] {
    return ['parentId', 'isActive', 'location'];
  }

  protected override getSearchFields(): (keyof MenuItem)[] {
    return ['label', 'href'];
  }
}
