/**
 * Dữ liệu đăng nhập admin (email, mật khẩu).
 * Dùng bởi: auth/auth.controller.ts, auth/auth.service.ts.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class StaffLoginDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin#123' })
  @IsString()
  password: string;
}
