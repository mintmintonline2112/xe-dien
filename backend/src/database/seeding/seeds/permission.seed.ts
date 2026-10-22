/**
 * Seed mã quyền bằng cách quét @Permissions trên các controller admin (vd PAGE_UPDATE), chỉ thêm mã còn thiếu.
 * Dùng bởi: database/seeding/seeding.service.ts (chạy đầu tiên).
 * Lưu ý: controller không có trong danh sách `controllers` thì quyền của nó không bao giờ được tạo → PermissionGuard chặn hết.
 * Cột module = tên controller viết thường bỏ hậu tố Controller; common/constants/notification-modules.ts phụ thuộc quy tắc này.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetadataScanner, Reflector } from '@nestjs/core';
import { Permission } from 'src/modules/admin/permissions/permission.entity';
import { StaffsController } from 'src/modules/admin/staffs/staffs.controller';
import { RolesController } from 'src/modules/admin/roles/roles.controller';
import { PermissionsController } from 'src/modules/admin/permissions/permissions.controller';
import { ProductsController } from 'src/modules/admin/products/products.controller';
import { ProductCategoriesController } from 'src/modules/admin/product-categories/product-categories.controller';
import { BlogPostsController } from 'src/modules/admin/blog-posts/blog-posts.controller';
import { BlogCategoriesController } from 'src/modules/admin/blog-categories/blog-categories.controller';
import { PagesController } from 'src/modules/admin/pages/pages.controller';
import { PageSectionsController } from 'src/modules/admin/pages/page-sections.controller';
import { LibraryController } from 'src/modules/admin/library/library.controller';
import { AdminContactController } from 'src/modules/admin/contact/admin-contact.controller';
import { AdminQuoteRequestsController } from 'src/modules/admin/quote-requests/admin-quote-requests.controller';
import { MenuItemsController } from 'src/modules/admin/menu-items/menu-items.controller';
import { SettingsController } from 'src/modules/admin/settings/settings.controller';
import { NotificationController } from 'src/modules/admin/notifications/notification.controller';

const PERMISSIONS_METADATA_KEY = 'permissions';
const ENTITY_METADATA_KEY = 'entity';

@Injectable()
export class PermissionSeed {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  async run(): Promise<void> {
    const existingPermissions = await this.permissionRepo.find();
    const existingCodes = new Set(
      existingPermissions.map((permission) => permission.code),
    );

    const controllers = [
      StaffsController,
      RolesController,
      PermissionsController,
      ProductsController,
      ProductCategoriesController,
      BlogPostsController,
      BlogCategoriesController,
      PagesController,
      PageSectionsController,
      LibraryController,
      AdminContactController,
      AdminQuoteRequestsController,
      MenuItemsController,
      SettingsController,
      NotificationController,
    ];

    const actionLabels: Record<string, string> = {
      CREATE: 'Create',
      UPDATE: 'Update',
      DELETE: 'Delete',
      LIST: 'List',
      DETAIL: 'Detail',
      SORT: 'Sort',
      BLOCK: 'Block/Unblock',
      UPDATE_STATUS: 'Update Status',
      EXPORT: 'Export Data',
      IMPORT: 'Import Data',
    };

    const entityLabels: Record<string, string> = {
      STAFF: 'Staff',
      ROLE: 'Role',
      PERMISSION: 'Permission',
      PRODUCT: 'Product',
      PRODUCT_CATEGORY: 'Product Category',
      BLOG_POST: 'Blog Post',
      BLOG_CATEGORY: 'Blog Category',
      PAGE: 'Page',
      PAGE_SECTION: 'Page Section',
      LIBRARY: 'Library',
      CONTACT: 'Contact',
      QUOTE_REQUEST: 'Consultation Request',
      NOTIFICATION: 'Notification',
    };

    const permissionsToInsert: Partial<Permission>[] = [];
    const standardActions = [
      'CREATE',
      'UPDATE',
      'DELETE',
      'LIST',
      'DETAIL',
      'SORT',
    ];

    for (const controllerClass of controllers) {
      const controllerProto = controllerClass.prototype as unknown as Record<
        string,
        unknown
      >;
      const entity = this.reflector.get<string>(
        ENTITY_METADATA_KEY,
        controllerClass,
      );
      const moduleName = controllerClass.name
        .replace(/Controller$/, '')
        .toLowerCase();
      const methodNames =
        this.metadataScanner.getAllMethodNames(controllerProto);

      methodNames.forEach((methodName) => {
        const methodRef = controllerProto[methodName] as
          | ((...args: unknown[]) => unknown)
          | undefined;
        if (!methodRef) return;

        const rawPermissions: string[] =
          this.reflector.get(PERMISSIONS_METADATA_KEY, methodRef) || [];

        rawPermissions.forEach((rawPermission) => {
          let code = rawPermission.toUpperCase();
          let action = code;

          if (standardActions.includes(code) && entity) {
            action = code;
            code = `${entity.toUpperCase()}_${code}`;
          } else if (entity && code.startsWith(`${entity.toUpperCase()}_`)) {
            action = code.replace(`${entity.toUpperCase()}_`, '');
          }

          if (code && !existingCodes.has(code)) {
            const entityName =
              entityLabels[entity?.toUpperCase()] || entity || 'System';
            const actionName = actionLabels[action] || action;

            permissionsToInsert.push({
              name: `${actionName} ${entityName}`,
              code: code,
              module: moduleName,
              description: `Allows performing ${actionName.toLowerCase()} action in ${entityName} module`,
            });
            existingCodes.add(code);
          }
        });
      });
    }

    if (permissionsToInsert.length > 0) {
      const newPermissions = this.permissionRepo.create(permissionsToInsert);
      await this.permissionRepo.save(newPermissions);
      console.log(
        `--- [Seed] Added ${permissionsToInsert.length} new permissions.`,
      );
    } else {
      console.log('--- [Seed] No new permissions found.');
    }
  }
}
