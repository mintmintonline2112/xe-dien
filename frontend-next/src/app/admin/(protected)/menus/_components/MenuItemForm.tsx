'use client';

/**
 * Form tạo / sửa mục menu website: vị trí (header / footer), tên, đường dẫn, menu cha, thứ tự, hiển thị, mở khung submenu, bản dịch tiếng Anh.
 * Dùng bởi: menus/create/page.tsx, menus/edit/[id]/page.tsx.
 * Lưu ý: chỉ menu gốc (parentId null) được chọn làm menu cha, nên menu chỉ có 2 cấp. Chọn menu cha thì mục con lưu theo vị trí của
 * menu cha (bỏ qua ô vị trí) để một cây không bị tách sang hai vị trí.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GenericForm } from '@/app/admin/_components/generic-form/GenericForm';
import type { GenericFormField, GenericSelectOption } from '@/app/admin/_components/generic-form/types';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { buildPayload } from '@/app/admin/_lib/crud-service';
import {
  EN_TRANSLATION_GROUP,
  buildEnFields,
  enValuesFrom,
  buildEnTranslationsPayload,
} from '@/app/admin/_lib/translation-fields';
import {
  menuItemService,
  MENU_ITEM_QUERY_KEY,
  MENU_LOCATION_OPTIONS,
  toMenuLocation,
  type MenuLocation,
} from '@/app/admin/(protected)/menus/_lib/menu-item.service';
import { adminRoutes } from '@/config/routes';
import { withQuery } from '@/utils/route';

interface FormValues {
  location: MenuLocation;
  label: string;
  href: string;
  parentId: string;
  description: string;
  isActive: boolean;
  showSubmenu: boolean;
  sortOrder: number;
  en_label: string;
}

const EN_KEYS = ['label'] as const;

const LOCATION_SHORT_LABEL: Record<MenuLocation, string> = { header: 'Header', footer: 'Footer' };

export function MenuItemForm({ id, defaultLocation = 'header' }: { id?: number; defaultLocation?: MenuLocation }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = id != null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<FormValues>({
    location: defaultLocation,
    label: '',
    href: '',
    parentId: '',
    description: '',
    isActive: true,
    showSubmenu: true,
    sortOrder: 1,
    en_label: '',
  });
  const [formKey, setFormKey] = useState(0);
  const [savedLocation, setSavedLocation] = useState<MenuLocation>(defaultLocation);

  const { data: allItems } = useQuery({
    queryKey: [...MENU_ITEM_QUERY_KEY, 'options'],
    queryFn: () => menuItemService.paginate({ limit: 1000 }),
  });

  const rootItems = useMemo(
    () => (allItems?.data ?? []).filter((item) => item.parentId == null && item.id !== id),
    [allItems, id],
  );

  const parentOptions: GenericSelectOption[] = useMemo(
    () =>
      rootItems.map((item) => ({
        label: `[${LOCATION_SHORT_LABEL[toMenuLocation(item.location)]}] ${item.label}`,
        value: item.id,
      })),
    [rootItems],
  );

  const { data } = useQuery({
    queryKey: [...MENU_ITEM_QUERY_KEY, 'detail', id],
    queryFn: () => menuItemService.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (data) {
      const location = toMenuLocation(data.location);
      setSavedLocation(location);
      setInitialValues({
        location,
        label: data.label ?? '',
        href: data.href ?? '',
        parentId: data.parentId != null ? String(data.parentId) : '',
        description: data.description ?? '',
        isActive: data.isActive ?? true,
        showSubmenu: data.showSubmenu ?? true,
        sortOrder: data.sortOrder ?? 1,
        ...enValuesFrom(data.translations, EN_KEYS),
      });
      setFormKey((previousKey) => previousKey + 1);
    }
  }, [data]);

  const listHref = withQuery(adminRoutes.menus.list, { location: savedLocation === 'footer' ? 'footer' : undefined });

  const fields: GenericFormField[] = useMemo(
    () => [
      {
        key: 'location',
        label: 'Vị trí menu',
        type: 'select',
        required: true,
        options: MENU_LOCATION_OPTIONS,
        hint: 'Menu chân trang: mục gốc là tiêu đề cột, mục con là link trong cột.',
      },
      { key: 'label', label: 'Tên hiển thị', type: 'text', required: true, placeholder: 'VD: Xe đạp điện' },
      {
        key: 'href',
        label: 'Đường dẫn',
        type: 'text',
        required: true,
        placeholder: '/danh-muc/xe-dap-dien hoặc /chinh-sach-bao-hanh',
        hint: 'Đường dẫn nội bộ (bắt đầu bằng /) hoặc link ngoài (https://...)',
      },
      {
        key: 'parentId',
        label: 'Thuộc menu',
        type: 'select',
        placeholder: '— Menu gốc —',
        options: parentOptions,
        hint: 'Chọn menu cha để biến mục này thành submenu (mục con theo vị trí của menu cha).',
      },
      { key: 'description', label: 'Ghi chú', type: 'text', placeholder: 'Ghi chú nội bộ (không hiển thị ngoài site)' },
      { key: 'sortOrder', label: 'Thứ tự', type: 'number', rules: { min: { value: 1, message: 'Tối thiểu là 1' } } },
      { key: 'isActive', label: 'Hiển thị', type: 'checkbox', hint: 'Cho phép hiển thị trên website' },
      {
        key: 'showSubmenu',
        label: 'Mở khung danh mục con',
        type: 'checkbox',
        hint: 'Bật: bấm menu mở khung danh mục con. Tắt: bấm là đi thẳng tới trang (chỉ áp dụng menu gốc ở header có submenu)',
      },
      ...buildEnFields([{ key: 'label', label: 'Tên hiển thị', type: 'text' }]),
    ],
    [parentOptions],
  );

  async function handleSubmit(values: FormValues) {
    const parent = values.parentId ? rootItems.find((item) => item.id === Number(values.parentId)) : undefined;
    const location = parent ? toMenuLocation(parent.location) : toMenuLocation(values.location);
    setIsSubmitting(true);
    try {
      const payload = buildPayload(
        {
          location,
          label: values.label,
          href: values.href,
          description: values.description,
          isActive: values.isActive,
          showSubmenu: values.showSubmenu,
          sortOrder: Number.isFinite(values.sortOrder) ? values.sortOrder : undefined,
          parentId: values.parentId ? Number(values.parentId) : null,
          translations: buildEnTranslationsPayload(values, EN_KEYS, data?.translations),
        },
        { keepNull: ['parentId', 'translations'] },
      );

      if (isEdit) await menuItemService.edit(id!, payload);
      else await menuItemService.add(payload);

      await queryClient.invalidateQueries({ queryKey: MENU_ITEM_QUERY_KEY });
      toast.success(isEdit ? 'Đã cập nhật menu' : 'Đã tạo menu');
      router.push(withQuery(adminRoutes.menus.list, { location: location === 'footer' ? 'footer' : undefined }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <GenericForm<FormValues>
      key={formKey}
      title={isEdit ? 'Sửa menu' : 'Tạo menu'}
      subtitle={isEdit ? 'Cập nhật mục menu website' : 'Thêm mục menu cho website'}
      breadcrumbs={[
        { label: 'Menu website', link: listHref },
        { label: isEdit ? 'Sửa' : 'Tạo mới' },
      ]}
      fields={fields}
      groups={[EN_TRANSLATION_GROUP]}
      defaultValues={initialValues}
      isLoading={isSubmitting}
      submitLabel={isEdit ? 'Cập nhật' : 'Tạo mới'}
      onSubmit={handleSubmit}
      onCancel={() => router.push(listHref)}
    />
  );
}
