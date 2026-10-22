/**
 * Module NestJS của vai trò.
 * Dùng bởi: modules/admin/admin.module.ts, database/seeding/seeding.module.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './roles.controller';
import { Role } from './role.entity';
import { RolesService } from './roles.service';
import { Permission } from '../permissions/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule {}
