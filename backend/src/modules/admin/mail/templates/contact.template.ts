/**
 * Dựng HTML email báo admin khi khách gửi form liên hệ trên website.
 * Dùng bởi: contact/contact.service.ts.
 */
import { CreateContactDto } from 'src/modules/admin/contact/dto/create-contact.dto';
import { escapeHtml } from './escape-html';

export const buildContactEmail = (data: CreateContactDto) => {
  const buildRow = (label: string, value?: string | null) =>
    value
      ? `<tr>
          <td style="padding:6px 12px;color:#5B6B63;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:6px 12px;color:#1A2420;">${escapeHtml(value).replace(/\n/g, '<br>')}</td>
        </tr>`
      : '';

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #D6E4DC;border-radius:8px;overflow:hidden;">
    <div style="background:#0A7D4F;color:#FFFFFF;padding:16px 24px;">
      <h2 style="margin:0;font-size:18px;">Liên hệ mới từ website</h2>
    </div>
    <table style="width:100%;border-collapse:collapse;padding:8px 12px;">
      ${buildRow('Họ tên', data.fullname)}
      ${buildRow('Email', data.email)}
      ${buildRow('Điện thoại', data.phone)}
      ${buildRow('Chủ đề', data.subject)}
      ${buildRow('Nội dung', data.message)}
    </table>
    <div style="padding:12px 24px;background:#F3F8F5;color:#5B6B63;font-size:12px;">
      © ${new Date().getFullYear()} Trạm Xe Điện — email tự động, gửi lúc ${new Date().toLocaleString('vi-VN')}.
    </div>
  </div>`;
};
