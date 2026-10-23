/**
 * API GET /admin/dashboard/summary trả số liệu tổng quan CMS, lọc theo quyền của người đang đăng nhập.
 * Dùng bởi: frontend-next app/admin/(protected)/dashboard/_components/DashboardScreen.tsx.
 * Lưu ý: cố ý không gắn PermissionGuard — dashboard là trang đầu tiên sau đăng nhập nên nhân viên nào cũng vào được;
 * quyền được áp ở dashboard.service.ts (thiếu quyền LIST của nhóm nào thì nhóm đó không được trả về).
 */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import type { JwtAdmin } from 'src/modules/admin/auth/strategies/jwt.strategy';
import { DashboardService } from './dashboard.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Thống kê tổng quan CMS theo quyền người xem' })
  getSummary(@CurrentUser() user: JwtAdmin) {
    return this.dashboardService.getSummary(user.permissions ?? []);
  }
}
