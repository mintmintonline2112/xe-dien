/**
 * Module NestJS của nhân viên.
 * Dùng bởi: modules/admin/admin.module.ts, auth/auth.module.ts, database/seeding/seeding.module.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffsController } from './staffs.controller';
import { Staff } from './staff.entity';
import { StaffsService } from './staffs.service';
import { RefreshToken } from '../refresh-token/refresh-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, RefreshToken])],
  providers: [StaffsService],
  controllers: [StaffsController],
  exports: [StaffsService],
})
export class StaffsModule {}
