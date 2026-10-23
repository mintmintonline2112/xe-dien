/**
 * CRUD vai trò kèm gán danh sách quyền; chặn sửa / xoá vai trò Admin của hệ thống.
 * Dùng bởi: roles.controller.ts, roles.module.ts.
 * Lưu ý: vai trò Admin nhận ra theo tên (không phân biệt hoa thường) "ADMIN".
 */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base/base.service';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from '../permissions/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService extends BaseService<Role, number> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super(roleRepository);
  }

  private async findEditableRole(id: number, action: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role)
      throw new NotFoundException(`Không tìm thấy vai trò có id ${id}`);

    if (role.name.toUpperCase() === 'ADMIN') {
      throw new ForbiddenException(
        `Không được ${action} vai trò quản trị hệ thống (Admin).`,
      );
    }

    return role;
  }

  override async create(data: any): Promise<Role> {
    const dto = data as CreateRoleDto;
    const { permissions, ...roleData } = dto;
    const permissionRefs = permissions?.map((id) => ({ id }));

    const entity = this.roleRepository.create({
      ...roleData,
      permissions: permissionRefs as any,
    });

    return await this.roleRepository.save(entity);
  }

  override async update(id: number, data: any): Promise<Role> {
    await this.findEditableRole(id, 'sửa');

    const dto = data as UpdateRoleDto;
    const { permissions, ...roleData } = dto;

    const roleWithRelations = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (permissions) {
      roleWithRelations.permissions = permissions.map((id) => ({ id })) as any;
    }
    Object.assign(roleWithRelations, roleData);

    return await this.roleRepository.save(roleWithRelations);
  }

  override async delete(id: number): Promise<any> {
    await this.findEditableRole(id, 'xoá');
    return await super.delete(id);
  }
}
