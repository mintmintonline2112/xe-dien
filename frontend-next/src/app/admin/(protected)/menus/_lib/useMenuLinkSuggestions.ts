/**
 * Gợi ý đường dẫn cho ô "Đường dẫn" của form menu: trang cố định, danh mục sản phẩm, danh mục blog, trang CMS — gõ tên để tìm.
 * Dùng bởi: menus/_components/MenuItemForm.tsx.
 * Lưu ý: trang dựng tay (home, products, news, contact) dùng route cố định của site, không theo slug; nameByHref dùng để tự điền
 * tên hiển thị khi admin chọn gợi ý mà ô tên còn trống.
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { GenericSelectOption } from '@/app/admin/_components/generic-form/types';
import {
  productCategoryService,
  PRODUCT_CATEGORY_QUERY_KEY,
} from '@/app/admin/(protected)/product-categories/_lib/product-category.service';
import { blogCategoryService, BLOG_CATEGORY_QUERY_KEY } from '@/app/admin/(protected)/blog-categories/_lib/blog-category.service';
import { pageService, PAGE_QUERY_KEY } from '@/app/admin/(protected)/pages/_lib/page.service';
import { siteRoutes } from '@/config/routes';

interface MenuLinkSuggestion {
  href: string;
  name: string;
  group: string;
}

const FIXED_LINKS: MenuLinkSuggestion[] = [
  { href: siteRoutes.home, name: 'Trang chủ', group: 'Trang' },
  { href: siteRoutes.products, name: 'Sản phẩm', group: 'Trang' },
  { href: siteRoutes.news, name: 'Tin tức', group: 'Trang' },
  { href: siteRoutes.contact, name: 'Liên hệ', group: 'Trang' },
];

const HAND_BUILT_PAGE_SLUGS = new Set(['home', 'products', 'news', 'contact']);

export function useMenuLinkSuggestions() {
  const { data: productCategories } = useQuery({
    queryKey: [...PRODUCT_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => productCategoryService.paginate({ limit: 1000 }),
  });
  const { data: blogCategories } = useQuery({
    queryKey: [...BLOG_CATEGORY_QUERY_KEY, 'options'],
    queryFn: () => blogCategoryService.paginate({ limit: 1000 }),
  });
  const { data: pages } = useQuery({
    queryKey: [...PAGE_QUERY_KEY, 'options'],
    queryFn: () => pageService.paginate({ limit: 1000 }),
  });

  return useMemo(() => {
    const links: MenuLinkSuggestion[] = [
      ...FIXED_LINKS,
      ...(productCategories?.data ?? []).map((category) => ({
        href: siteRoutes.category(category.slug),
        name: category.name,
        group: 'Danh mục sản phẩm',
      })),
      ...(blogCategories?.data ?? []).map((category) => ({
        href: siteRoutes.newsCategory(category.slug),
        name: category.displayName || category.name,
        group: 'Danh mục tin tức',
      })),
      ...(pages?.data ?? [])
        .filter((page) => !HAND_BUILT_PAGE_SLUGS.has(page.slug))
        .map((page) => ({
          href: siteRoutes.page(page.slug),
          name: page.title,
          group: page.status === 'published' ? 'Trang' : 'Trang (nháp)',
        })),
    ];
    const suggestions: GenericSelectOption[] = links.map((link) => ({
      value: link.href,
      label: `${link.group} · ${link.name}`,
    }));
    const nameByHref = new Map(links.map((link) => [link.href, link.name]));
    return { suggestions, nameByHref };
  }, [productCategories, blogCategories, pages]);
}
