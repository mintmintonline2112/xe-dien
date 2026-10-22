/**
 * API admin xem, lọc (trạng thái, loại yêu cầu), xuất Excel, đổi trạng thái và xoá yêu cầu tư vấn (/admin/quote-requests).
 * Dùng bởi: quote-requests.module.ts.
 * Lưu ý: entity + mã quyền ở @Permissions được database/seeding/seeds/permission.seed.ts đọc để sinh quyền; đổi là đổi quyền.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { UpdateQuoteRequestStatusDto } from './dto/update-quote-request-status.dto';
import {
  QuoteRequestStatus,
  type QuoteRequestType,
} from './entities/quote-request.entity';
import { QuoteRequestsService } from './quote-requests.service';

@ApiTags('Admin - Quote Requests')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'QUOTE_REQUEST')
@Controller('admin/quote-requests')
export class AdminQuoteRequestsController {
  constructor(private readonly quoteRequestsService: QuoteRequestsService) {}

  @Get()
  @Permissions('LIST')
  @ApiOperation({ summary: 'Danh sách yêu cầu tư vấn' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('status') status?: QuoteRequestStatus,
    @Query('requestType') requestType?: QuoteRequestType,
  ) {
    return this.quoteRequestsService.findAll(
      page,
      limit,
      search,
      status,
      requestType,
    );
  }

  @Get('export')
  @Permissions('EXPORT')
  @ApiOperation({ summary: 'Xuất Excel danh sách yêu cầu tư vấn' })
  async export(@Res() res: Response) {
    const buffer = await this.quoteRequestsService.exportAll();
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="yeu-cau-tu-van.xlsx"',
    });
    res.send(buffer);
  }

  @Get(':id')
  @Permissions('DETAIL')
  @ApiOperation({ summary: 'Chi tiết yêu cầu tư vấn' })
  findOne(@Param('id') id: number) {
    return this.quoteRequestsService.findById(Number(id));
  }

  @Patch(':id/status')
  @Permissions('UPDATE_STATUS')
  @ApiOperation({ summary: 'Cập nhật trạng thái xử lý' })
  updateStatus(
    @Param('id') id: number,
    @Body() body: UpdateQuoteRequestStatusDto,
  ) {
    return this.quoteRequestsService.updateStatus(Number(id), body.status);
  }

  @Delete(':id')
  @Permissions('DELETE')
  @ApiOperation({ summary: 'Xóa yêu cầu tư vấn' })
  remove(@Param('id') id: number) {
    return this.quoteRequestsService.delete(Number(id));
  }
}
