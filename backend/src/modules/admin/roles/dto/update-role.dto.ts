/**
 * Dữ liệu sửa vai trò: mọi field của CreateRoleDto, đều không bắt buộc.
 * Dùng bởi: roles.controller.ts, roles.service.ts.
 */
import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
