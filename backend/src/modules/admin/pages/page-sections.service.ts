/**
 * CRUD section của trang; trước khi lưu thì chặn trùng section key và kiểm tra metadata theo spec component.
 * Dùng bởi: page-sections.controller.ts, pages.module.ts, scripts/layout-sync (layout-import, layout-sync.shared).
 * Lưu ý: chặn trùng (pageId, sectionKey) trước để admin không gặp lỗi 500 "Duplicate entry" của MySQL.
 * Spec lấy theo metadata._component, không có thì theo sectionKey; component không có trong danh mục thì bỏ qua.
 * Key ngoài spec được giữ nguyên; metadata bản dịch được kiểm theo layout của bản gốc.
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Not, Repository } from 'typeorm';
import { BaseService } from 'src/common/base/base.service';
import { PageSection } from './entities/page-section.entity';
import {
  SectionDefinition,
  SectionFieldSpec,
} from './entities/section-definition.entity';

type MetadataObject = Record<string, unknown>;

const ROOT_TEXT_MAP_KEY = '__self__';

const isPlainObject = (value: unknown): value is MetadataObject =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const isStringOrEmpty = (value: unknown) =>
  value === undefined || value === null || typeof value === 'string';

const isFieldForOtherLayout = (
  spec: SectionFieldSpec,
  layout: string | undefined,
) => !!spec.layouts && (!layout || !spec.layouts.includes(layout));

export function validateSectionMetadata(
  fields: SectionFieldSpec[],
  metadata: MetadataObject,
  scope = '',
): string[] {
  const problems: string[] = [];
  const withScope = (label: string) => `${scope}${label}`;
  const layout =
    typeof metadata.layout === 'string' ? metadata.layout : undefined;

  for (const spec of fields) {
    if (isFieldForOtherLayout(spec, layout)) continue;

    if (spec.type === 'textMap') {
      const isRootTextMap = spec.key === ROOT_TEXT_MAP_KEY;
      const target = isRootTextMap ? metadata : metadata[spec.key];
      if (!isRootTextMap && target !== undefined && !isPlainObject(target)) {
        problems.push(`${withScope(spec.label)} phải là nhóm ô chữ`);
        continue;
      }
      for (const field of spec.fields) {
        const value = isPlainObject(target) ? target[field.name] : undefined;
        if (!isStringOrEmpty(value))
          problems.push(`${withScope(field.label)} phải là chữ`);
      }
      continue;
    }

    const value = metadata[spec.key];
    if (value === undefined || value === null) continue;

    switch (spec.type) {
      case 'stringList':
        if (
          !Array.isArray(value) ||
          value.some((entry) => typeof entry !== 'string')
        ) {
          problems.push(`${withScope(spec.label)} phải là danh sách chữ`);
        }
        break;
      case 'itemList':
        if (
          !Array.isArray(value) ||
          value.some(
            (item) =>
              typeof item !== 'string' &&
              !(
                isPlainObject(item) &&
                Object.values(item).every(isStringOrEmpty)
              ),
          )
        ) {
          problems.push(
            `${withScope(spec.label)} phải là danh sách mục (mỗi ô là chữ)`,
          );
        }
        break;
      case 'image':
        if (typeof value !== 'string')
          problems.push(`${withScope(spec.label)} phải là đường dẫn ảnh`);
        if (spec.positionKey && !isStringOrEmpty(metadata[spec.positionKey])) {
          problems.push(
            `${withScope(spec.label)} · vị trí ảnh phải là chữ (VD 50% 62%)`,
          );
        }
        break;
      case 'select':
        if (
          typeof value !== 'string' ||
          !spec.options.some((option) => option.value === value)
        ) {
          problems.push(
            `${withScope(spec.label)} phải là một trong: ${spec.options.map((option) => option.value).join(', ')}`,
          );
        }
        break;
      case 'json':
        break;
    }
  }
  return problems;
}

@Injectable()
export class PageSectionsService extends BaseService<PageSection, number> {
  constructor(
    @InjectRepository(PageSection)
    sectionRepo: Repository<PageSection>,
    @InjectRepository(SectionDefinition)
    private readonly definitionRepo: Repository<SectionDefinition>,
  ) {
    super(sectionRepo);
  }

  private async assertSectionKeyFree(
    pageId: number,
    sectionKey: string,
    excludeId?: number,
  ): Promise<void> {
    const existing = await this.repo.findOne({
      where: {
        pageId,
        sectionKey,
        ...(excludeId != null ? { id: Not(excludeId) } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(
        `Trang này đã có section key "${sectionKey}" (id ${existing.id}). ` +
          'Sửa section đó, hoặc nhập Section key khác nếu muốn dùng component này lần nữa.',
      );
    }
  }

  private async assertMetadataMatchesSpec(
    componentKey: string | undefined,
    metadata: unknown,
    translations: unknown,
  ): Promise<void> {
    if (
      metadata !== undefined &&
      metadata !== null &&
      !isPlainObject(metadata)
    ) {
      throw new BadRequestException('Metadata phải là một object.');
    }
    if (!componentKey) return;
    const definition = await this.definitionRepo.findOne({
      where: { sectionKey: componentKey },
    });
    if (!definition) return;

    const problems = isPlainObject(metadata)
      ? validateSectionMetadata(definition.fields, metadata)
      : [];

    if (isPlainObject(translations)) {
      for (const [lang, translation] of Object.entries(translations)) {
        if (
          !isPlainObject(translation) ||
          translation.metadata === undefined ||
          translation.metadata === null
        ) {
          continue;
        }
        if (!isPlainObject(translation.metadata)) {
          problems.push(`Bản dịch ${lang}: metadata phải là một object`);
          continue;
        }
        const originalLayout = isPlainObject(metadata)
          ? metadata.layout
          : undefined;
        problems.push(
          ...validateSectionMetadata(
            definition.fields,
            { ...translation.metadata, layout: originalLayout },
            `Bản dịch ${lang} · `,
          ),
        );
      }
    }

    if (problems.length > 0) {
      throw new BadRequestException(
        `Dữ liệu khối không hợp lệ: ${problems.join('; ')}.`,
      );
    }
  }

  private componentKeyOf(metadata: unknown, sectionKey: string | undefined) {
    const componentFromMetadata = isPlainObject(metadata)
      ? metadata._component
      : undefined;
    return typeof componentFromMetadata === 'string' && componentFromMetadata
      ? componentFromMetadata
      : sectionKey;
  }

  async create(data: DeepPartial<PageSection>): Promise<PageSection> {
    if (data.pageId != null && data.sectionKey) {
      await this.assertSectionKeyFree(data.pageId, data.sectionKey);
    }
    await this.assertMetadataMatchesSpec(
      this.componentKeyOf(data.metadata, data.sectionKey),
      data.metadata,
      data.translations,
    );
    return super.create(data);
  }

  async update(
    id: number,
    data: DeepPartial<PageSection>,
    manager?: Parameters<BaseService<PageSection, number>['update']>[2],
  ): Promise<PageSection> {
    const current = await this.repo.findOne({
      where: { id },
      select: { id: true, pageId: true, sectionKey: true, metadata: true },
    });

    if (current && (data.sectionKey || data.pageId != null)) {
      await this.assertSectionKeyFree(
        data.pageId ?? current.pageId,
        data.sectionKey ?? current.sectionKey,
        id,
      );
    }

    if (data.metadata !== undefined || data.translations !== undefined) {
      const metadata =
        data.metadata !== undefined ? data.metadata : current?.metadata;
      await this.assertMetadataMatchesSpec(
        this.componentKeyOf(metadata, data.sectionKey ?? current?.sectionKey),
        metadata,
        data.translations,
      );
    }

    return super.update(id, data, manager);
  }
}
