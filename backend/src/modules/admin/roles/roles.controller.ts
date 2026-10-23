/**
 * API admin CRUD vai trò (/admin/roles), trả kèm danh sách quyền.
 * Dùng bởi: roles.module.ts; trang admin frontend-next/src/app/admin/(protected)/roles.
 * Lưu ý: entity + mã quyền ở @Permissions được database/seeding/seeds/permission.seed.ts đọc để sinh quyền; đổi là đổi quyền.
 */
import { Body, Controller, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/base/base.controller';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './role.entity';
import { RolesService } from './roles.service';
import type { FindManyOptions, FindOneOptions } from 'typeorm';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';

@ApiTags('Roles')
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'ROLE')
@Controller('admin/roles')
export class RolesController extends BaseController<
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  number
> {
  constructor(private readonly rolesService: RolesService) {
    super(rolesService, 'ROLE', {
      create: CreateRoleDto,
      update: UpdateRoleDto,
    });
  }

  protected override getSearchFields(): (keyof Role)[] {
    return ['name'];
  }

  protected override getFindAllOptions(): FindManyOptions<Role> {
    return { relations: { permissions: true } };
  }

  protected override getFindOneOptions(id: number): FindOneOptions<Role> {
    return { where: { id } as any, relations: { permissions: true } };
  }

  @Post()
  @Permissions('CREATE')
  @ApiBody({ type: CreateRoleDto })
  async create(@Body() dto: CreateRoleDto) {
    return super.create(dto);
  }
}
