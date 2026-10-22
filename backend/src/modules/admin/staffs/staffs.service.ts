/**
 * Tạo, sửa, khoá / mở khoá, xoá tài khoản nhân viên; băm mật khẩu bằng bcrypt.
 * Dùng bởi: staffs.controller.ts, staffs.module.ts, auth/auth.service.ts.
 * Lưu ý: không được sửa / khoá / xoá tài khoản type ADMIN, cũng không tự khoá / xoá chính mình.
 * Đổi mật khẩu phải nhập mật khẩu hiện tại, trừ khi người thao tác là admin.
 */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base/base.service';
import { Staff } from './staff.entity';
import { Not, Repository } from 'typeorm';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { AccountType } from 'src/common/enums/account-type.enum';
import { isAdmin } from 'src/common/helpers/is-admin.helper';

@Injectable()
export class StaffsService extends BaseService<Staff, string> {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {
    super(staffRepository);
  }

  private async findEditableStaff(id: string, action: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } as any });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    if (staff.type === AccountType.ADMIN) {
      throw new BadRequestException(
        `Cannot ${action} system administrator account`,
      );
    }

    return staff;
  }

  async createStaff(data: CreateStaffDto): Promise<Staff> {
    const existingStaff = await this.staffRepository.findOne({
      where: { email: data.email },
    });

    if (existingStaff) {
      throw new BadRequestException('Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const staff = this.staffRepository.create({
      ...data,
      password: hashedPassword,
    });

    return await this.staffRepository.save(staff);
  }

  async updateStaff(
    id: string,
    data: UpdateStaffDto,
    actorId?: string,
  ): Promise<Staff> {
    const staff = await this.findEditableStaff(id, 'update');

    if (data.email) {
      const existingStaff = await this.staffRepository.findOne({
        where: { email: data.email, id: Not(id) },
      });

      if (existingStaff) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updateData: any = { ...data };

    const nextRoleId = data.role_id ?? data.roleId;
    if (nextRoleId !== undefined) {
      updateData.role_id = nextRoleId;
      delete updateData.roleId;
    }

    if (data.password) {
      if (!data.confirmPassword) {
        throw new BadRequestException('Confirm password is required');
      }

      if (data.password !== data.confirmPassword) {
        throw new BadRequestException('Password confirmation does not match');
      }

      let isActorAdmin = false;

      if (actorId) {
        isActorAdmin = await isAdmin(this.staffRepository, actorId);
      }

      if (!isActorAdmin) {
        if (!data.currentPassword) {
          throw new BadRequestException('Current password is required');
        }

        const isCurrentPasswordCorrect = await bcrypt.compare(
          data.currentPassword,
          staff.password,
        );

        if (!isCurrentPasswordCorrect) {
          throw new BadRequestException('Current password is incorrect');
        }
      }

      updateData.password = await bcrypt.hash(data.password, 10);
    }

    delete updateData.currentPassword;
    delete updateData.confirmPassword;

    const entity = await this.staffRepository.preload({
      id,
      ...updateData,
    });

    if (!entity) {
      throw new NotFoundException(`Staff with id ${id} not found`);
    }

    return await this.staffRepository.save(entity);
  }

  async toggleStatus(id: string, actorId?: string): Promise<Staff> {
    if (actorId && actorId === id) {
      throw new BadRequestException(
        'You cannot block/unblock your own account',
      );
    }

    const staff = await this.findEditableStaff(id, 'change status');

    staff.status =
      staff.status === AccountStatus.ACTIVE
        ? AccountStatus.BLOCKED
        : AccountStatus.ACTIVE;

    return await this.staffRepository.save(staff);
  }

  override async delete(id: string, actorId?: string) {
    if (actorId && actorId === id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    await this.findEditableStaff(id, 'delete');
    return await super.delete(id);
  }
}
