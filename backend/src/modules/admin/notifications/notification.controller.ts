/**
 * API admin xem thông báo ở chuông (/admin/notifications) và đánh dấu đã đọc.
 * Dùng bởi: notification.module.ts; frontend-next/src/app/admin/_components/notifications-bell.tsx.
 * Lưu ý: mark-as-read cố ý dùng quyền LIST (không phải UPDATE): ai xem được danh sách thì tắt được chấm đỏ.
 * Entity + mã quyền được database/seeding/seeds/permission.seed.ts đọc để sinh quyền.
 */
import { BaseController } from 'src/common/base/base.controller';
import { NotificationService } from './notification.service';
import { AppNotification } from './notification.entity';
import {
  Body,
  Controller,
  Patch,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';

@ApiTags('Notifications')
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'NOTIFICATION')
@Controller('admin/notifications')
export class NotificationController extends BaseController<
  AppNotification,
  CreateNotificationDto,
  UpdateNotificationDto,
  number
> {
  constructor(private readonly appNotificationService: NotificationService) {
    super(appNotificationService, 'Notifications');
  }

  @Permissions('LIST')
  @Patch('mark-as-read')
  async markAsRead(@Body('ids') ids: number[]) {
    return await this.appNotificationService.markAsRead(ids);
  }
}
