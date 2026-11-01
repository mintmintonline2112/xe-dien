/**
 * API /admin/catalog-import: trang Nhập sản phẩm từ website gọi để xem hồ sơ site + lượt cào, bắt đầu cào, xem trước, đẩy vào CMS,
 * theo dõi / dừng việc đang chạy, xoá lượt cào.
 * Dùng bởi: frontend-next app/admin/(protected)/product-import/_lib/product-import.service.ts.
 * Lưu ý: link ảnh trong mô tả sản phẩm nhập vào lấy host của request này (giống upload Thư viện). Quyền theo entity PRODUCT — xem cần PRODUCT_LIST, cào / nhập cần PRODUCT_CREATE, xoá lượt cào cần PRODUCT_DELETE.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAdmin } from '../auth/strategies/jwt.strategy';
import { CatalogImportService } from './catalog-import.service';
import { StartCrawlDto } from './dto/start-crawl.dto';
import { StartPushDto } from './dto/start-push.dto';

@ApiTags('Admin - Catalog import')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'PRODUCT')
@Controller('admin/catalog-import')
export class CatalogImportController {
  constructor(private readonly catalogImportService: CatalogImportService) {}

  @Get()
  @Permissions('LIST')
  @ApiOperation({ summary: 'Hồ sơ site, các lượt cào và việc đang chạy' })
  getOverview() {
    return this.catalogImportService.getOverview();
  }

  @Get('job')
  @Permissions('LIST')
  getJob() {
    return this.catalogImportService.getJob();
  }

  @Post('job/cancel')
  @Permissions('CREATE')
  cancelJob() {
    return this.catalogImportService.cancelJob();
  }

  @Get('runs/:runId')
  @Permissions('LIST')
  getRun(@Param('runId') runId: string) {
    return this.catalogImportService.getRun(runId);
  }

  @Delete('runs/:runId')
  @Permissions('DELETE')
  deleteRun(@Param('runId') runId: string) {
    return this.catalogImportService.deleteRun(runId);
  }

  @Post('crawl')
  @Permissions('CREATE')
  @ApiOperation({ summary: 'Bắt đầu cào một danh mục của website nguồn' })
  startCrawl(@Body() dto: StartCrawlDto, @CurrentUser() user: JwtAdmin) {
    return this.catalogImportService.startCrawl(dto, user);
  }

  @Post('push')
  @Permissions('CREATE')
  @ApiOperation({ summary: 'Đẩy một lượt cào vào danh mục sản phẩm' })
  startPush(
    @Body() dto: StartPushDto,
    @CurrentUser() user: JwtAdmin,
    @Req() request: Request,
  ) {
    const mediaBaseUrl = `${request.protocol}://${request.get('host')}`;
    return this.catalogImportService.startPush(dto, user, mediaBaseUrl);
  }
}
