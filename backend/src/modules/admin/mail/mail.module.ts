/**
 * Module gửi email qua SMTP.
 * Dùng bởi: contact/contact.module.ts, quote-requests/quote-requests.module.ts.
 */
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}