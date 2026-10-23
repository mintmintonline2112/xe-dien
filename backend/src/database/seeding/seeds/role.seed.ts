/**
 * Seed hai vai trò Admin (mọi quyền) và Staff (chỉ quyền _LIST / _DETAIL).
 * Dùng bởi: database/seeding/seeding.service.ts (chạy sau permission.seed.ts).
 * Lưu ý: deploy.sh chạy seed mỗi lần deploy. Admin luôn được cấp lại đủ quyền (kể cả quyền mới thêm); Staff chỉ được gán quyền
 * lúc tạo lần đầu, sau đó giữ nguyên để quyền admin chỉnh trong trang Vai trò không bị deploy ghi đè.
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
        description: 'Toàn quyền quản trị hệ thống',
      });
    adminRole.permissions = allPermissions;
    const rolesToSave = [adminRole];

    if (!existingRoles.some((role) => role.name === 'Staff')) {
      rolesToSave.push(
        this.roleRepo.create({
          name: 'Staff',
          description: 'Chỉ xem danh sách và chi tiết nội dung',
          permissions: staffPermissions,
        }),
      );
    }

    await this.roleRepo.save(rolesToSave);
  }
}
