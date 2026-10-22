/**
 * Seed hai vai trò Admin (mọi quyền) và Staff (chỉ quyền _LIST / _DETAIL); chạy lại thì cập nhật quyền theo danh sách hiện có.
 * Dùng bởi: database/seeding/seeding.service.ts (chạy sau permission.seed.ts).
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from 'src/modules/admin/permissions/permission.entity';
import { Role } from 'src/modules/admin/roles/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleSeed {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  async run(): Promise<void> {
    const allPermissions = await this.permissionRepo.find();
    const staffPermissions = allPermissions.filter(
      (permission) =>
        permission.code.endsWith('_LIST') ||
        permission.code.endsWith('_DETAIL'),
    );

    const existingRoles = await this.roleRepo.find({
      relations: { permissions: true },
    });
    const adminRole =
      existingRoles.find((role) => role.name === 'Admin') ??
      this.roleRepo.create({
        name: 'Admin',
        description: 'Full access to all system functions',
      });
    adminRole.permissions = allPermissions;

    const staffRole =
      existingRoles.find((role) => role.name === 'Staff') ??
      this.roleRepo.create({
        name: 'Staff',
        description: 'Read-only access for daily content operations',
      });
    staffRole.permissions = staffPermissions;

    await this.roleRepo.save([adminRole, staffRole]);
  }
}
