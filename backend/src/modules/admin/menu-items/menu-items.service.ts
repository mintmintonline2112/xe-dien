/**
 * CRUD mục menu và dựng cây menu public theo vị trí (header / footer): gốc + con, đã ghép bản dịch theo ngôn ngữ.
 * Dùng bởi: menu-items.controller.ts, client-menu.controller.ts, menu-items.module.ts.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { applyTranslations, type Lang } from 'src/common/i18n/translations';
import { MenuItem, type MenuLocation } from './menu-item.entity';

@Injectable()
export class MenuItemsService extends BaseService<MenuItem, number> {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepo: Repository<MenuItem>,
  ) {
    super(menuRepo);
  }

  async findPublicTree(
    location: MenuLocation = 'header',
    lang: Lang = 'vi',
  ): Promise<MenuItem[]> {
    const rows = await this.menuRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    const items = rows.map((item) => applyTranslations(item, lang));

    const roots = items.filter(
      (item) => item.parentId == null && item.location === location,
    );
    return roots.map((root) => ({
      ...root,
      children: items.filter((item) => item.parentId === root.id),
    }));
  }
}
