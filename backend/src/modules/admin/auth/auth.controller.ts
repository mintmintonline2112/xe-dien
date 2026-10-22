/**
 * API /admin/auth: đăng nhập (admin, nhân viên), làm mới phiên, đăng xuất, lấy thông tin và sửa hồ sơ người đang đăng nhập.
 * Dùng bởi: frontend-next app/admin/_auth/AuthProvider.tsx, app/admin/_lib/admin-api.ts.
 * Lưu ý: login và login-staff giới hạn 5 lần / phút mỗi IP.
 */
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { StaffLoginDto } from '../staffs/dto/staff-login.dto';
import { AuthService } from './auth.service';
import { AuthExceptionFilter } from 'src/common/filters/auth-exception.filter';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from '../staffs/dto/update-profile.dto';

@ApiTags('Admin Auth')
@ApiBearerAuth()
@Controller('/admin/auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(
    @Body() dto: StaffLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, req, res);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login-staff')
  async loginStaff(
    @Body() dto: StaffLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginStaff(dto, req, res);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(req, res);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('me')
  getMe(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.getMe(req, res);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const staffId = (req.user as { id: string }).id;
    return this.authService.updateProfile(staffId, dto, file);
  }
}
