/**
 * API admin CRUD section của trang (/admin/page-sections); ghi xong thì xoá cache trang.
 * Dùng bởi: pages.module.ts; trang admin frontend-next/src/app/admin/(protected)/page-sections.
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
import { PageSection } from './entities/page-section.entity';
import { CreatePageSectionDto } from './dto/create-page-section.dto';
import { UpdatePageSectionDto } from './dto/update-page-section.dto';
import { PageSectionsService } from './page-sections.service';

@ApiTags('Admin - Page Sections')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@UseInterceptors(InvalidateCacheInterceptor)
@SetMetadata('entity', 'PAGE_SECTION')
@SetMetadata(CACHE_NAMESPACES_KEY, [CACHE_NS.pages])
@Controller('admin/page-sections')
export class PageSectionsController extends BaseController<
  PageSection,
  CreatePageSectionDto,
  UpdatePageSectionDto,
  number
> {
  constructor(private readonly sectionsService: PageSectionsService) {
    super(sectionsService, 'PageSection', {
      create: CreatePageSectionDto,
      update: UpdatePageSectionDto,
    });
  }

  protected getFilterableFields(): (keyof PageSection)[] {
    return ['pageId', 'isActive'];
  }

  protected override getSearchFields(): (keyof PageSection)[] {
    return ['sectionKey', 'heading'];
  }
}
