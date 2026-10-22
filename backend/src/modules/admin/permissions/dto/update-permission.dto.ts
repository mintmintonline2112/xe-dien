/**
 * Dữ liệu sửa quyền: mọi field của CreatePermissionDto, đều không bắt buộc.
 * Dùng bởi: permissions.controller.ts.
 */
import { PartialType } from '@nestjs/swagger';
import { CreatePermissionDto } from './create-permission.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
