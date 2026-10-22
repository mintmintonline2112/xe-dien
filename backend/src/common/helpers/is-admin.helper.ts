/**
 * Kiểm tra một nhân viên (theo id) có phải tài khoản loại admin không.
 * Dùng bởi: modules/admin/staffs/staffs.service.ts.
 */
import { Repository } from 'typeorm';

import { AccountType } from 'src/common/enums/account-type.enum';
import { Staff } from 'src/modules/admin/staffs/staff.entity';

export const isAdmin = async (
  staffRepository: Repository<Staff>,
  actorId: string,
): Promise<boolean> => {
  const staff = await staffRepository.findOne({
    where: { id: actorId } as any,
    select: ['id', 'type'],
  });

  return staff?.type === AccountType.ADMIN;
};
