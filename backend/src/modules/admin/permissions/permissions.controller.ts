/**
 * API admin CRUD quyền (/admin/permissions), lọc được theo module.
 * Dùng bởi: permissions.module.ts; trang admin frontend-next/src/app/admin/(protected)/permissions.
 * Lưu ý: entity + mã quyền ở @Permissions được database/seeding/seeds/permission.seed.ts đọc để sinh quyền; đổi là đổi quyền.
 */
import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from 'src/common/base/base.controller';
import { Permission } from './permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guards/admin/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';

@ApiTags('Permissions')
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'PERMISSION')
@Controller('admin/permissions')
export class PermissionsController extends BaseController<
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
  number
> {
  constructor(private readonly permissionsService: PermissionsService) {
    super(permissionsService, 'PERMISSION', {
      create: CreatePermissionDto,
      update: UpdatePermissionDto,
    });
  }

  protected getFilterableFields(): (keyof Permission)[] {
    return ['module'];
  }

  @Post()
  @Permissions('CREATE')
  @ApiBody({ type: CreatePermissionDto })
  @ApiResponse({
    status: 201,
    description: 'Permission has been successfully created.',
  })
  async create(@Body() createDto: CreatePermissionDto): Promise<Permission> {
    return super.create(createDto);
  }

  @Put(':id')
  @Permissions('UPDATE')
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({
    status: 200,
    description: 'Permission has been successfully updated.',
  })
  async update(
    @Param('id') id: number,
    @Body() updateDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return super.update(id, updateDto);
  }
}
