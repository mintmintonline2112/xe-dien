/**
 * Dựng HTML email nội bộ báo có yêu cầu tư vấn mới từ website; field trống thì bỏ dòng đó.
 * Dùng bởi: quote-requests/quote-requests.service.ts.
 */
import { CreateQuoteRequestDto } from 'src/modules/admin/quote-requests/dto/create-quote-request.dto';
import { QUOTE_REQUEST_TYPE_LABELS } from 'src/modules/admin/quote-requests/entities/quote-request.entity';
import { escapeHtml } from './escape-html';

export function buildQuoteRequestEmail(data: CreateQuoteRequestDto): string {
  const buildRow = (label: string, value?: string | number | null) =>
    value
      ? `<tr>
          <td style="padding:6px 12px;color:#5B6B63;white-space:nowrap;">${label}</td>
          <td style="padding:6px 12px;color:#1A2420;"><strong>${escapeHtml(value).replace(/\n/g, '<br>')}</strong></td>
        </tr>`
      : '';

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #D6E4DC;border-radius:8px;overflow:hidden;">
    <div style="background:#0A7D4F;color:#FFFFFF;padding:16px 24px;">
      <h2 style="margin:0;font-size:18px;">Yêu cầu tư vấn mới</h2>
    </div>
    <table style="width:100%;border-collapse:collapse;padding:8px 12px;">
      ${buildRow('Loại yêu cầu', QUOTE_REQUEST_TYPE_LABELS[data.requestType ?? 'consult'])}
      ${buildRow('Họ tên', data.fullName)}
      ${buildRow('Điện thoại', data.phone)}
      ${buildRow('Email', data.email)}
      ${buildRow('Tỉnh / thành', data.province)}
      ${buildRow('Sản phẩm', data.productName)}
      ${buildRow('Nội dung', data.message)}
      ${buildRow('Trang gửi', data.sourceUrl)}
    </table>
    <div style="padding:12px 24px;background:#F3F8F5;color:#5B6B63;font-size:12px;">
      © ${new Date().getFullYear()} Trạm Xe Điện — email tự động từ form tư vấn trên website.
    </div>
  </div>`;
}
