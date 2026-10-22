/**
 * Lưu yêu cầu tư vấn từ website, tạo thông báo admin, gửi mail; tìm / lọc, đổi trạng thái, xuất Excel.
 * Dùng bởi: quote-requests.controller.ts, admin-quote-requests.controller.ts.
 * Lưu ý: lỗi tạo thông báo hoặc gửi mail chỉ ghi cảnh báo, yêu cầu vẫn được lưu; mail chỉ gửi khi có MAIL_FROM.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { MailService } from '../mail/mail.service';
import { buildQuoteRequestEmail } from '../mail/templates/quote-request.template';
import { AppNotification } from '../notifications/notification.entity';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import {
  QUOTE_REQUEST_TYPE_LABELS,
  QuoteRequest,
  QuoteRequestStatus,
  type QuoteRequestType,
} from './entities/quote-request.entity';
import { NOTIFICATION_MODULE } from 'src/common/constants/notification-modules';

@Injectable()
export class QuoteRequestsService extends BaseService<QuoteRequest, number> {
  constructor(
    @InjectRepository(QuoteRequest)
    private readonly quoteRepo: Repository<QuoteRequest>,
    @InjectRepository(AppNotification)
    private readonly notificationRepo: Repository<AppNotification>,
    private readonly mailService: MailService,
  ) {
    super(quoteRepo);
  }

  async submit(data: CreateQuoteRequestDto): Promise<{ id: number }> {
    const requestType = data.requestType ?? 'consult';
    const quote = await this.create({
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim() || null,
      province: data.province?.trim() || null,
      requestType,
      productId: data.productId ?? null,
      productName: data.productName?.trim() || null,
      message: data.message?.trim() || null,
      sourceUrl: data.sourceUrl?.trim() || null,
      status: QuoteRequestStatus.NEW,
    });

    const typeLabel = QUOTE_REQUEST_TYPE_LABELS[requestType];

    try {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          type: 'quote-request',
          module: NOTIFICATION_MODULE.quoteRequest,
          title: `${typeLabel}: ${data.fullName} — ${data.phone}`,
          message: data.productName || data.message?.slice(0, 120) || typeLabel,
          metadata: { link: '/admin/contacts', quoteRequestId: quote.id },
        }),
      );
    } catch {
      console.warn('Đã lưu yêu cầu tư vấn nhưng tạo thông báo admin lỗi');
    }

    if (process.env.MAIL_FROM) {
      try {
        await this.mailService.sendMail({
          to: process.env.MAIL_FROM,
          subject: `[${typeLabel}] ${data.fullName} — ${data.phone}${data.productName ? ` — ${data.productName}` : ''}`,
          replyTo: data.email || undefined,
          html: buildQuoteRequestEmail(data),
        });
      } catch {
        console.warn('Đã lưu yêu cầu tư vấn nhưng gửi email thông báo lỗi');
      }
    }

    return { id: quote.id };
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    status?: QuoteRequestStatus,
    requestType?: QuoteRequestType,
  ) {
    const filters: Record<string, unknown> = {};
    if (status) filters.status = status;
    if (requestType) filters.requestType = requestType;
    return this.paginate(
      {},
      page,
      limit,
      search,
      ['fullName', 'phone', 'email', 'productName', 'province'],
      filters,
    );
  }

  async findById(id: number): Promise<QuoteRequest> {
    const quote = await this.findOne({ where: { id } });
    if (!quote) {
      throw new NotFoundException(`Không tìm thấy yêu cầu tư vấn ${id}`);
    }
    return quote;
  }

  async updateStatus(
    id: number,
    status: QuoteRequestStatus,
  ): Promise<QuoteRequest> {
    return this.update(id, { status });
  }

  async exportAll(): Promise<Buffer> {
    const rows = await this.find({ order: { createdAt: 'DESC' } });
    const rowsWithTypeLabel = rows.map((row) => ({
      ...row,
      requestType: QUOTE_REQUEST_TYPE_LABELS[row.requestType] ?? row.requestType,
    }));
    return this.exportToExcel(
      rowsWithTypeLabel,
      {
        id: 'ID',
        createdAt: 'Thời gian gửi',
        requestType: 'Loại yêu cầu',
        fullName: 'Họ tên',
        phone: 'Điện thoại',
        email: 'Email',
        province: 'Tỉnh / thành',
        productName: 'Sản phẩm',
        message: 'Nội dung',
        sourceUrl: 'Trang gửi',
        status: 'Trạng thái',
      },
      'Yeu cau tu van',
    );
  }
}
