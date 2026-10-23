/**
 * Seed tài khoản quản trị mặc định (1 admin, 1 staff) khi bảng nhân viên còn trống; mật khẩu băm bcrypt.
 * Dùng bởi: database/seeding/seeding.service.ts (chạy sau role.seed.ts).
 * Lưu ý: đây là tài khoản / mật khẩu cho môi trường dev — ĐỔI MẬT KHẨU trước khi lên production.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { AccountType } from 'src/common/enums/account-type.enum';

import { Role } from 'src/modules/admin/roles/role.entity';
import { Staff } from 'src/modules/admin/staffs/staff.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StaffSeed {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    const staffCount = await this.staffRepo.count();
    if (staffCount > 0) return;

    const [adminRole, staffRole] = await Promise.all([
      this.roleRepo.findOne({ where: { name: 'Admin' } }),
      this.roleRepo.findOne({ where: { name: 'Staff' } }),
    ]);

    if (!adminRole) {
      throw new Error('Missing role: Admin');
    }

    const saltRounds = 10;

    const rawStaffs: Array<Partial<Staff>> = [
      {
        staffCode: 'ADM001',
        name: 'Quản trị Xe Điện Xanh',
        email: 'admin@gmail.com',
        password: 'admin#123',
        role: adminRole,
        type: AccountType.ADMIN,
        status: AccountStatus.ACTIVE,
      },
      {
        staffCode: 'STF001',
        name: 'Nhân viên bán hàng',
        email: 'staff1@gmail.com',
        password: 'staff#123',
        role: staffRole ?? adminRole,
        type: AccountType.STAFF,
        status: AccountStatus.ACTIVE,
      },
    ];

    const staffData: Partial<Staff>[] = await Promise.all(
      rawStaffs.map(async (staff) => ({
        ...staff,
        password: await bcrypt.hash(staff.password, saltRounds),
      })),
    );

    const newStaffs = this.staffRepo.create(staffData);
    await this.staffRepo.save(newStaffs);

    console.log(
      `--- [Seed] Created ${newStaffs.length} staffs with staffCodes.`,
    );
  }
}
