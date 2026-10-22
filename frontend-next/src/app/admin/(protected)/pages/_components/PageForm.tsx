'use client';

/**
 * Form tạo / sửa trang website: tiêu đề, eyebrow, đoạn dẫn, ảnh nền đầu trang, template, trạng thái, SEO, bản dịch;
 * khi sửa thì hiện thêm bảng section của trang (PageSectionsPanel).
 * Dùng bởi: pages/create/page.tsx, pages/edit/[id]/page.tsx.
 * Lưu ý: ảnh nền + điểm lấy nét giữ ngoài GenericForm (UI riêng, chèn ngay dưới ô Đoạn dẫn). Ô văn bản xoá trắng thì gửi
 * null để backend xoá giá trị cũ (giống buildSeoPayload).
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/GenericForm';
import type { GenericFormField } from '@/app/admin/_components/generic-form/types';
import {
  SEO_FIELDS,
  EMPTY_SEO,
  seoValuesFrom,
  buildSeoPayload,
  type SeoFormValues,
  SEO_NULLABLE_KEYS,
} from '@/app/admin/_lib/seo-fields';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { buildPayload } from '@/app/admin/_lib/crud-service';
import { PUBLISH_STATUS_OPTIONS, type PublishStatus } from '@/app/admin/_lib/publish-status';
import {
  EN_TRANSLATION_GROUP,
  buildEnFields,
  enValuesFrom,
  buildEnTranslationsPayload,
} from '@/app/admin/_lib/translation-fields';
import { pageService, PAGE_QUERY_KEY } from '@/app/admin/(protected)/pages/_lib/page.service';
import { PageSectionsPanel } from '@/app/admin/(protected)/pages/_components/PageSectionsPanel';
import { HeroImageField } from '@/app/admin/(protected)/pages/_components/HeroImageField';
import { adminRoutes } from '@/config/routes';

interface FormValues extends SeoFormValues {
  title: string;
  eyebrow: string;
  lead: string;
  templateKey: string;
  status: PublishStatus;
  en_title: string;
  en_eyebrow: string;
  en_lead: string;
  en_metaTitle: string;
  en_metaDescription: string;
}

const EN_KEYS = ['title', 'eyebrow', 'lead', 'metaTitle', 'metaDescription'] as const;

const EMPTY_FORM_VALUES: FormValues = {
  title: '',
  eyebrow: '',
  lead: '',
  templateKey: '',
  status: 'draft',
  ...EMPTY_SEO,
  en_title: '',
  en_eyebrow: '',
  en_lead: '',
  en_metaTitle: '',
  en_metaDescription: '',
};

const FIELDS: GenericFormField[] = [
  { key: 'title', label: 'Tiêu đề trang', type: 'text', required: true, placeholder: 'VD: Chính sách bảo hành' },
  { key: 'eyebrow', label: 'Eyebrow', type: 'text', placeholder: 'Dòng chữ nhỏ phía trên tiêu đề (VD: Về chúng tôi)' },
  { key: 'lead', label: 'Đoạn dẫn', type: 'textarea', placeholder: 'Đoạn mô tả ngắn dưới tiêu đề trang' },
  { key: 'templateKey', label: 'Template key', type: 'text', placeholder: 'VD: about, services', hint: 'Khóa nhận diện template render phía frontend' },
  { key: 'status', label: 'Trạng thái', type: 'select', required: true, options: PUBLISH_STATUS_OPTIONS },
  ...SEO_FIELDS,
  ...buildEnFields([
    { key: 'title', label: 'Tiêu đề trang', type: 'text' },
    { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
    { key: 'lead', label: 'Đoạn dẫn', type: 'textarea' },
    { key: 'metaTitle', label: 'SEO · Meta Title', type: 'text' },
    { key: 'metaDescription', label: 'SEO · Meta Description', type: 'textarea' },
  ]),
];

export function PageForm({ id }: { id?: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>(EMPTY_FORM_VALUES);
  const [formKey, setFormKey] = useState(0);
  const [heroImage, setHeroImage] = useState('');
  const [heroPosition, setHeroPosition] = useState('');

  const { data } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'detail', id],
    queryFn: () => pageService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      setInitialValues({
        title: data.title ?? '',
        eyebrow: data.eyebrow ?? '',
        lead: data.lead ?? '',
        templateKey: data.templateKey ?? '',
        status: data.status ?? 'draft',
        ...seoValuesFrom(data),
        ...enValuesFrom(data.translations, EN_KEYS),
      });
      setHeroImage(data.heroImagePath ?? '');
      setHeroPosition(data.heroImagePosition ?? '');
      setFormKey((previousKey) => previousKey + 1);
    }
  }, [data]);

  const fieldsWithHeroImage = useMemo<GenericFormField[]>(
    () =>
      FIELDS.map((field) =>
        field.key === 'lead'
          ? {
              ...field,
              renderExtra: () => (
                <HeroImageField
                  image={heroImage}
                  position={heroPosition}
                  onImageChange={setHeroImage}
                  onPositionChange={setHeroPosition}
                />
              ),
            }
          : field,
      ),
    [heroImage, heroPosition],
  );

  const sections = useMemo(
    () => (data?.sections ?? []).slice().sort((sectionA, sectionB) => sectionA.sortOrder - sectionB.sortOrder),
    [data],
  );

  async function handleSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const payload = buildPayload(
        {
          title: values.title,
          eyebrow: values.eyebrow.trim() ? values.eyebrow : null,
          lead: values.lead.trim() ? values.lead : null,
          templateKey: values.templateKey.trim() ? values.templateKey : null,
          heroImagePath: heroImage.trim() || null,
          heroImagePosition: heroImage.trim() && heroPosition ? heroPosition : null,
          status: values.status,
          ...buildSeoPayload(values),
          translations: buildEnTranslationsPayload(values, EN_KEYS, data?.translations),
        },
        {
          keepNull: [
            'translations',
            'eyebrow',
            'lead',
            'templateKey',
            'heroImagePath',
            'heroImagePosition',
            ...SEO_NULLABLE_KEYS,
          ],
        },
      );

      if (isEdit) await pageService.edit(id!, payload);
      else await pageService.add(payload);

      await queryClient.invalidateQueries({ queryKey: PAGE_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật trang' : 'Đã tạo trang');
      router.push(adminRoutes.pages.list);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <GenericForm<FormValues>
        key={formKey}
        title={isEdit ? 'Sửa trang' : 'Tạo trang'}
        subtitle={isEdit ? 'Cập nhật thông tin trang nội dung' : 'Thêm trang nội dung mới'}
        breadcrumbs={[
          { label: 'Trang nội dung', link: adminRoutes.pages.list },
          { label: isEdit ? 'Sửa' : 'Tạo mới' },
        ]}
        fields={fieldsWithHeroImage}
        groups={[EN_TRANSLATION_GROUP]}
        defaultValues={initialValues}
        isLoading={isSubmitting}
        submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
        onSubmit={handleSubmit}
        onCancel={() => router.push(adminRoutes.pages.list)}
      />

      {isEdit && id != null && <PageSectionsPanel pageId={id} sections={sections} />}
    </>
  );
}
