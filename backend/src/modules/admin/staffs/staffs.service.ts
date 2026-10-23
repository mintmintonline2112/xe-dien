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
      throw new NotFoundException('Không tìm thấy nhân viên');
    }

    if (staff.type === AccountType.ADMIN) {
      throw new BadRequestException(
        `Không được ${action} tài khoản quản trị hệ thống`,
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
    const staff = await this.findEditableStaff(id, 'sửa');

    if (data.email) {
      const existingStaff = await this.staffRepository.findOne({
        where: { email: data.email, id: Not(id) },
      });

      if (existingStaff) {
        throw new BadRequestException('Email đã được sử dụng');
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
        throw new BadRequestException('Vui lòng nhập mật khẩu xác nhận');
      }

      if (data.password !== data.confirmPassword) {
        throw new BadRequestException('Mật khẩu xác nhận không khớp');
      }

      let isActorAdmin = false;

      if (actorId) {
        isActorAdmin = await isAdmin(this.staffRepository, actorId);
      }

      if (!isActorAdmin) {
        if (!data.currentPassword) {
          throw new BadRequestException('Vui lòng nhập mật khẩu hiện tại');
        }

        const isCurrentPasswordCorrect = await bcrypt.compare(
          data.currentPassword,
          staff.password,
        );

        if (!isCurrentPasswordCorrect) {
          throw new BadRequestException('Mật khẩu hiện tại không đúng');
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
      throw new NotFoundException(`Không tìm thấy nhân viên có id ${id}`);
    }

    return await this.staffRepository.save(entity);
  }

  async toggleStatus(id: string, actorId?: string): Promise<Staff> {
    if (actorId && actorId === id) {
      throw new BadRequestException(
        'Bạn không thể khoá / mở khoá tài khoản của chính mình',
      );
    }

    const staff = await this.findEditableStaff(id, 'đổi trạng thái');

    staff.status =
      staff.status === AccountStatus.ACTIVE
        ? AccountStatus.BLOCKED
        : AccountStatus.ACTIVE;

    return await this.staffRepository.save(staff);
  }

  override async delete(id: string, actorId?: string) {
    if (actorId && actorId === id) {
      throw new BadRequestException(
        'Bạn không thể xoá tài khoản của chính mình',
      );
    }

    await this.findEditableStaff(id, 'xoá');
    return await super.delete(id);
  }
}
