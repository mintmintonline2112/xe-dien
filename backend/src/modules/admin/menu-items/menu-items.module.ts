/**
 * Module NestJS gom entity, service và hai controller (admin + public) của menu.
 * Dùng bởi: modules/admin/admin.module.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './menu-item.entity';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { ClientMenuController } from './client-menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItem])],
  controllers: [MenuItemsController, ClientMenuController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
