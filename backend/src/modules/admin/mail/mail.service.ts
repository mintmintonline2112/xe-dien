/**
 * Gửi email qua SMTP (nodemailer) với người gửi "Xe Điện Xanh": email tự do, mã OTP, link đặt lại mật khẩu.
 * Dùng bởi: contact/contact.service.ts, quote-requests/quote-requests.service.ts (qua MailModule).
 * Lưu ý: thiếu MAIL_HOST / MAIL_USER / MAIL_PASS thì không tạo kết nối SMTP, mọi lần gửi chỉ ghi cảnh báo và trả null.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { MailConfig } from 'src/config/mail.config';
import { buildOtpEmail } from './templates/otp.template';
import { buildPasswordResetEmail } from './templates/reset-password.template';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const mailConfig = this.configService.get<MailConfig>('mail');

    if (mailConfig?.host && mailConfig?.user && mailConfig?.pass) {
      this.transporter = nodemailer.createTransport({
        host: mailConfig.host,
        port: mailConfig.port,
        auth: {
          user: mailConfig.user,
          pass: mailConfig.pass,
        },
      });
    }
  }

  onModuleInit() {
    if (!this.transporter) {
      console.log('Mail is not configured (MAIL_HOST/MAIL_USER/MAIL_PASS) — skipping SMTP.');
      return;
    }
    this.transporter.verify((error: Error | null, success: boolean) => {
      if (error) {
        console.error('SMTP connection failed:', error);
      } else {
        console.log('SMTP is ready to send emails');
      }
    });
  }

  private async deliver(options: nodemailer.SendMailOptions) {
    if (!this.transporter) {
      console.warn(`Mail is disabled — skipped email "${String(options.subject)}" to ${String(options.to)}`);
      return null;
    }
    return this.transporter.sendMail(options);
  }

  async sendOtpEmail(to: string, otp: string) {
    const mailConfig = this.configService.get<MailConfig>('mail');

    if (!to) {
      throw new Error('Recipient email is required');
    }

    const htmlContent = buildOtpEmail(otp);

    return this.deliver({
      from: `"Xe Điện Xanh" <${mailConfig.from}>`,
      to,
      subject: '[Xe Điện Xanh] Mã xác minh tài khoản',
      html: htmlContent,
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string) {
    const mailConfig = this.configService.get<MailConfig>('mail');
    return this.deliver({
      from: `"Xe Điện Xanh" <${mailConfig.from}>`,
      to,
      subject: '[Xe Điện Xanh] Yêu cầu đặt lại mật khẩu',
      html: buildPasswordResetEmail(resetLink),
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
  }) {
    const mailConfig = this.configService.get<MailConfig>('mail');

    return this.deliver({
      from: `"Xe Điện Xanh" <${mailConfig.from}>`,
      ...options,
    });
  }

}