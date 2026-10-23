/**
 * Kiểm tra dữ liệu form liên hệ khách gửi.
 * Dùng bởi: contact.controller.ts, contact.service.ts, mail/templates/contact.template.ts.
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullname: string;

  @ApiProperty({ example: 'a@gmail.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;

  @ApiProperty({ example: 'Hỏi sản phẩm', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subject?: string;

  @ApiProperty({ example: 'Tôi cần tư vấn...', minLength: 10 })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(5000)
  message: string;
}
