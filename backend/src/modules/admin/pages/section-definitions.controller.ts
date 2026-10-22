/**
 * API admin chỉ đọc danh mục loại section (/admin/section-definitions) để dựng form section trực quan.
 * Dùng bởi: pages.module.ts; frontend-next/src/app/admin/(protected)/page-sections/_lib/page-section.service.ts.
 * Lưu ý: dữ liệu do seed đồng bộ theo code nên không có CRUD; dùng chung quyền PAGE_SECTION.
 */
import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { SectionDefinition } from './entities/section-definition.entity';

@ApiTags('Admin - Section Definitions')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'PAGE_SECTION')
@Controller('admin/section-definitions')
export class SectionDefinitionsController {
  constructor(
    @InjectRepository(SectionDefinition)
    private readonly definitionRepo: Repository<SectionDefinition>,
  ) {}

  @Get()
  @Permissions('LIST')
  @ApiOperation({ summary: 'Danh mục loại section của website' })
  findAll(): Promise<SectionDefinition[]> {
    return this.definitionRepo.find({
      order: { pageSlug: 'ASC', sortOrder: 'ASC' },
    });
  }
}
