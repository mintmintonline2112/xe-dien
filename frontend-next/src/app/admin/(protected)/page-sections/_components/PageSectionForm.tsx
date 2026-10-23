'use client';

/**
 * Form tạo / sửa section của một trang: chọn component bằng thẻ có hình, chỉnh metadata trực quan.
 * Dùng bởi: page-sections/create/page.tsx (bước 2, có ?pageId=), page-sections/edit/[id]/page.tsx.
 * Lưu ý: website render theo metadata._component (component = bố cục, biến thể = metadata.layout), danh mục ở bảng
 * section_definitions. Section gắn cố định một trang; khi sửa thì component + section key khoá (key là id neo, đổi hỏng link menu).
 * (pageId, sectionKey) unique: tạo mới tự thêm hậu tố -2, -3… và xếp cuối trang. Ô xoá trắng gửi null tường minh (richtext
 * '<p></p>' coi là rỗng). mediaPath chỉ khối generic đọc; ẩn chứ không xoá nên giá trị cũ vẫn giữ khi lưu.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/GenericForm';
import type { GenericFormField, GenericSelectOption } from '@/app/admin/_components/generic-form/types';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { buildPayload } from '@/app/admin/_lib/crud-service';
import { pageService, PAGE_QUERY_KEY } from '@/app/admin/(protected)/pages/_lib/page.service';
import { ComponentPicker } from './ComponentPicker';
import { MetadataEditor } from './MetadataEditor';
import {
  fetchSectionDefinitions,
  pageSectionService,
  PAGE_SECTION_QUERY_KEY,
  SECTION_DEFINITION_QUERY_KEY,
} from '@/app/admin/(protected)/page-sections/_lib/page-section.service';
import { adminRoutes } from '@/config/routes';

const GENERIC_COMPONENT_KEY = '__custom';

interface FormValues {
  sectionKeyCustom: string;
  heading: string;
  subheading: string;
  showEyebrow: boolean;
  content: string;
  mediaPath: string;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM_VALUES: FormValues = {
  sectionKeyCustom: '',
  heading: '',
  subheading: '',
  showEyebrow: false,
  content: '',
  mediaPath: '',
  isActive: true,
  sortOrder: 1,
};

type SectionMetadata = Record<string, unknown>;

export function PageSectionForm({ id, presetPageId }: { id?: number; presetPageId?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY_FORM_VALUES);
  const [formKey, setFormKey] = useState(0);
  const [metadata, setMetadata] = useState<SectionMetadata>({});
  const [component, setComponent] = useState('');

  const { data: pages } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'options'],
    queryFn: () => pageService.paginate({ limit: 1000 }),
  });

  const { data: definitions, isLoading: isDefinitionsLoading } = useQuery({
    queryKey: SECTION_DEFINITION_QUERY_KEY,
    queryFn: fetchSectionDefinitions,
    staleTime: 5 * 60_000,
  });

  const { data: savedSection } = useQuery({
    queryKey: [...PAGE_SECTION_QUERY_KEY, 'detail', id],
    queryFn: () => pageSectionService.getById(id!),
    enabled: isEdit,
  });

  const lockedPageId = isEdit ? savedSection?.pageId : presetPageId;
  const lockedPage = useMemo(
    () => (pages?.data ?? []).find((page) => page.id === lockedPageId),
    [pages, lockedPageId],
  );

  const { data: lockedPageDetail } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'detail', lockedPageId],
    queryFn: () => pageService.getById(lockedPageId!),
    enabled: lockedPageId != null,
  });

  const usedKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const pageSection of lockedPageDetail?.sections ?? []) {
      if (isEdit && pageSection.id === id) continue;
      keys.add(pageSection.sectionKey);
    }
    return keys;
  }, [lockedPageDetail, isEdit, id]);

  const findFreeSectionKey = useCallback(
    (base: string) => {
      if (!usedKeys.has(base)) return base;
      let suffix = 2;
      while (usedKeys.has(`${base}-${suffix}`)) suffix += 1;
      return `${base}-${suffix}`;
    },
    [usedKeys],
  );

  const pageOptions: GenericSelectOption[] = useMemo(
    () => (pages?.data ?? []).map((page) => ({ label: `${page.title} (/${page.slug})`, value: page.id })),
    [pages],
  );

  const pageDefinitions = useMemo(
    () => (definitions ?? []).slice().sort((definitionA, definitionB) => definitionA.sortOrder - definitionB.sortOrder),
    [definitions],
  );

  useEffect(() => {
    if (!savedSection) return;
    const savedMetadata = (savedSection.metadata as SectionMetadata | null) ?? {};
    const savedComponent = typeof savedMetadata._component === 'string' ? savedMetadata._component : null;
    const componentKey =
      savedComponent && (definitions ?? []).some((definition) => definition.sectionKey === savedComponent)
        ? savedComponent
        : (definitions ?? []).some((definition) => definition.sectionKey === savedSection.sectionKey)
          ? savedSection.sectionKey
          : GENERIC_COMPONENT_KEY;
    setMetadata(savedMetadata);
    setComponent(componentKey);
    setInitialValues({
      sectionKeyCustom: savedSection.sectionKey ?? '',
      heading: savedSection.heading ?? '',
      subheading: savedSection.subheading ?? '',
      showEyebrow: savedMetadata.showEyebrow === true,
      content: savedSection.content ?? '',
      mediaPath: savedSection.mediaPath ?? '',
      isActive: savedSection.isActive ?? true,
      sortOrder: savedSection.sortOrder ?? 1,
    });
    setFormKey((previousKey) => previousKey + 1);
  }, [savedSection, definitions]);

  const hasSeededSortOrder = useRef(false);
  useEffect(() => {
    if (isEdit || hasSeededSortOrder.current || !lockedPageDetail) return;
    hasSeededSortOrder.current = true;
    const lastSortOrder = Math.max(0, ...(lockedPageDetail.sections ?? []).map((pageSection) => pageSection.sortOrder ?? 0));
    setInitialValues((current) => ({ ...current, sortOrder: lastSortOrder + 1 }));
    setFormKey((previousKey) => previousKey + 1);
  }, [isEdit, lockedPageDetail]);

  const pageTitle = lockedPage?.title ?? '';
  const selectedDefinition = useMemo(
    () => (definitions ?? []).find((definition) => definition.sectionKey === component),
    [definitions, component],
  );

  const fields: GenericFormField[] = useMemo(
    () => [
      {
        key: 'pageId',
        label: 'Thuộc trang',
        type: 'select',
        disabled: true,
        placeholder: 'Đang tải trang…',
        options: pageOptions,
        hint: isEdit
          ? 'Section đã gắn với trang này nên không đổi được. Muốn đưa khối sang trang khác thì tạo section mới ở trang đó.'
          : 'Trang đã chọn ở bước 1 — muốn đổi trang thì quay lại bước chọn trang.',
        renderExtra: () => (
          <div className="gf-field" style={{ marginTop: 18 }}>
            <label className="gf-label">
              Component (kiểu khối) <span style={{ color: 'var(--admin-danger)' }}>*</span>
            </label>
            <p className="gf-hint" style={{ margin: '0 0 2px' }}>
              {isEdit
                ? 'Kiểu khối cố định sau khi tạo. Muốn đổi cách hiển thị thì đổi "Bố cục" trong khối bên dưới (dữ liệu giữ nguyên); muốn dùng component khác thì tạo section mới rồi tắt hoặc xoá section này.'
                : !pageTitle
                  ? 'Đang tải danh sách component…'
                  : 'Mỗi component là một bố cục, dùng được ở mọi trang. Nhiều component có thêm lựa chọn "Bố cục" bên dưới sau khi chọn.'}
            </p>
            <ComponentPicker
              definitions={pageDefinitions}
              value={component}
              onChange={(key) => {
                setComponent(key);
                const metadataWithDefaultLayout = { ...metadata };
                delete metadataWithDefaultLayout.layout;
                setMetadata(metadataWithDefaultLayout);
              }}
              genericValue={GENERIC_COMPONENT_KEY}
              isLocked={isEdit}
              isLoading={isDefinitionsLoading || !lockedPage}
            />
            {!isEdit && component && component !== GENERIC_COMPONENT_KEY && usedKeys.has(component) ? (
              <p className="gf-hint" style={{ marginTop: 8, color: 'var(--admin-brass-ink, var(--admin-text))' }}>
                Trang đã có khối này rồi. Vẫn dùng được lần nữa — section key sẽ tự đặt là{' '}
                <code>{findFreeSectionKey(component)}</code>, hoặc tự nhập key riêng ở ô dưới.
              </p>
            ) : null}
          </div>
        ),
      },
      {
        key: 'sectionKeyCustom',
        label: 'Section key (định danh trong trang)',
        type: 'text',
        disabled: isEdit,
        placeholder: 'để trống = dùng tên component — VD: slider-gioi-thieu',
        hint: isEdit
          ? 'Key cố định sau khi tạo — nó cũng là id neo trên website (VD /#request-quote), đổi sẽ làm hỏng link trong menu.'
          : 'Key phải duy nhất trong mỗi trang. Đặt tên riêng khi dùng cùng một component nhiều lần trên một trang (VD: 2 slider).',
      },
      { key: 'subheading', label: 'Eyebrow (dòng nhỏ phía trên)', type: 'text', placeholder: 'VD: Global Distribution' },
      {
        key: 'showEyebrow',
        label: 'Hiện eyebrow trên website',
        type: 'checkbox',
        hint: 'Eyebrow phía trên tiêu đề đang ẩn trên toàn site (sếp không thích subtitle). Tick để hiện riêng ở section này.',
      },
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Tiêu đề khối nội dung' },
      {
        key: 'content',
        label: 'Nội dung (đoạn giới thiệu của khối)',
        type: 'richtext',
        placeholder: 'Đoạn văn dẫn nhập hiển thị dưới tiêu đề…',
        renderExtra: () => (
          <MetadataEditor
            definition={component === GENERIC_COMPONENT_KEY ? undefined : selectedDefinition}
            value={metadata}
            onChange={setMetadata}
          />
        ),
      },
      {
        key: 'mediaPath',
        type: 'imageUrl',
        label: 'Ảnh minh họa',
        hint: 'Ảnh hiển thị trong khối generic.',
        hidden: component !== GENERIC_COMPONENT_KEY,
      },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number', rules: { min: { value: 1, message: 'Tối thiểu là 1' } } },
      { key: 'isActive', label: 'Hiển thị', type: 'checkbox', hint: 'Tắt thì khối này ẩn khỏi website (bật lại là hiện). Xoá section cũng làm khối biến mất.' },
    ],
    [
      pageOptions,
      isEdit,
      pageTitle,
      pageDefinitions,
      component,
      isDefinitionsLoading,
      lockedPage,
      selectedDefinition,
      metadata,
      usedKeys,
      findFreeSectionKey,
    ],
  );

  const backHref = !isEdit && presetPageId ? adminRoutes.pages.edit(presetPageId) : adminRoutes.pageSections.list;

  async function handleSubmit(values: FormValues) {
    if (!lockedPageId) {
      toast.error('Chưa xác định được trang của section');
      return;
    }
    if (!component) {
      toast.error('Chọn một component (kiểu khối)');
      return;
    }
    const componentKey = component === GENERIC_COMPONENT_KEY ? null : component;
    const typedKey = (values.sectionKeyCustom ?? '').trim();
    const sectionKey = isEdit
      ? (savedSection?.sectionKey ?? '')
      : typedKey || (componentKey ? findFreeSectionKey(componentKey) : '');
    if (!sectionKey) {
      toast.error('Khối generic cần nhập Section key');
      return;
    }
    if (usedKeys.has(sectionKey)) {
      toast.error(`Trang này đã có section key "${sectionKey}" — đặt key khác cho khối mới.`);
      return;
    }

    const metadataToSave: SectionMetadata = { ...metadata };
    if (componentKey) metadataToSave._component = componentKey;
    else delete metadataToSave._component;
    if (values.showEyebrow) metadataToSave.showEyebrow = true;
    else delete metadataToSave.showEyebrow;

    setIsSubmitting(true);
    try {
      const emptyRichTextPattern = /^(\s*<p>\s*<\/p>\s*)*$/;
      const toNullIfEmpty = (raw: string) => {
        const value = raw.trim();
        return value && !emptyRichTextPattern.test(value) ? raw : null;
      };

      const payload = buildPayload(
        {
          pageId: lockedPageId,
          sectionKey,
          heading: toNullIfEmpty(values.heading),
          subheading: toNullIfEmpty(values.subheading),
          content: toNullIfEmpty(values.content),
          mediaPath: toNullIfEmpty(values.mediaPath ?? ''),
          isActive: values.isActive,
          sortOrder: Number.isFinite(values.sortOrder) ? values.sortOrder : undefined,
          metadata: Object.keys(metadataToSave).length > 0 ? metadataToSave : null,
        },
        {
          keepNull: ['heading', 'subheading', 'content', 'mediaPath', 'metadata'],
        },
      );

      if (isEdit) await pageSectionService.edit(id!, payload);
      else await pageSectionService.add(payload);

      await queryClient.invalidateQueries({ queryKey: PAGE_SECTION_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật section' : 'Đã tạo section');
      router.push(backHref);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={`${isEdit ? 'Sửa section' : 'Tạo section'}${pageTitle ? ` · ${pageTitle}` : ''}`}
      subtitle={
        isEdit
          ? 'Cập nhật khối nội dung của trang — website render theo component + bố cục'
          : 'Bước 2/2 — chọn component và nhập nội dung cho khối'
      }
      breadcrumbs={[
        { label: 'Section trang', link: adminRoutes.pageSections.list },
        ...(pageTitle && lockedPageId ? [{ label: pageTitle, link: adminRoutes.pages.edit(lockedPageId) }] : []),
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={fields}
      defaultValues={{ ...initialValues, pageId: lockedPageId ? String(lockedPageId) : '' } as FormValues}
      isLoading={isSubmitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(backHref)}
    />
  );
}
