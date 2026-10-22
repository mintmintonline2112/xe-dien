/**
 * CRUD quyền và gom danh sách quyền theo module.
 * Dùng bởi: permissions.controller.ts, permissions.module.ts.
 */
import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base/base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService extends BaseService<Permission> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super(permissionRepository);
  }

  async findAllGrouped() {
    const permissions = await this.permissionRepository.find();

    const groupedByModule = permissions.reduce(
      (groups, permission) => {
        const moduleName = permission.module;
        if (!groups[moduleName]) {
          groups[moduleName] = [];
        }
        groups[moduleName].push(permission);
        return groups;
      },
      {} as Record<string, Permission[]>,
    );

    return groupedByModule;
  }
}
