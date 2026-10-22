/**
 * CRUD trang; tự sinh slug không trùng khi tạo hoặc khi đổi slug.
 * Dùng bởi: pages.controller.ts, pages.module.ts.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { generateUniqueSlug } from 'src/common/helpers/slug.helper';
import { Page } from './entities/page.entity';

@Injectable()
export class PagesService extends BaseService<Page, number> {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
  ) {
    super(pageRepo);
  }

  override async create(data: DeepPartial<Page>): Promise<Page> {
    const slug = await generateUniqueSlug(
      this.pageRepo,
      data.slug || data.title,
    );
    return super.create({ ...data, slug });
  }

  override async update(
    id: number,
    data: DeepPartial<Page>,
    manager?: EntityManager,
  ): Promise<Page> {
    if (data.slug !== undefined) {
      const existing = await this.pageRepo.findOne({ where: { id } });
      const slugSource = data.slug || data.title || existing?.title || '';
      data = {
        ...data,
        slug: await generateUniqueSlug(this.pageRepo, slugSource, {
          excludeId: id,
        }),
      };
    }
    return super.update(id, data, manager);
  }
}
