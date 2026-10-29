# Xe Điện Xanh — Frontend (Next.js)

Site public tiếng Việt + trang quản trị CMS của Xe Điện Xanh, dựng theo Next.js 15 App Router (React 19), nối với
`backend/` (NestJS). Hợp đồng dữ liệu sản phẩm / danh mục / yêu cầu tư vấn: [`docs/catalog-api.md`](../docs/catalog-api.md).

## Chạy

```
npm install
npm run dev        # http://localhost:3006 (site) · /admin (quản trị)
npm run check      # typecheck + lint + lint:layers + lint:sections — chạy trước khi commit
npm run snapshot / shot / diff:png   # so HTML + ảnh trước/sau khi refactor — xem scripts/README.md
npm run build && npm start           # production, cổng 3006
```

Tạo `.env.local` từ `.env.example`: `API_URL` / `NEXT_PUBLIC_API_URL` trỏ về backend (`http://localhost:3020/api`),
`NEXT_PUBLIC_SITE_URL` là địa chỉ site, `REVALIDATE_SECRET` khớp `backend/.env`. Thiếu `.env.local` thì dùng mặc định
trong `src/config/env.ts` (cùng các cổng trên).

## Cấu trúc

Theo chuẩn App Router: **route groups** `(group)` gom layout mà không đổi URL,
**private folders** `_folder` chứa code không phải route, đặt cạnh route dùng nó.

```
src/
├── app/
│   ├── layout.tsx                 # Root layout (lang="vi", metadata, styles/tailwind.css)
│   ├── (site)/                    # Site public — URL: /, /san-pham, /san-pham/[slug], /danh-muc/[slug], /tin-tuc, /tin-tuc/[slug], /lien-he, /[slug]
│   │   ├── layout.tsx             # Header (menu CMS) + Footer + ContactDock + SiteEffects
│   │   ├── _components/           # Xem _components/README.md
│   │   │   ├── layout/            # Khung trang: Header, Footer, Brand, CategoryDrawer, SearchForm, ContactDock, SocialIcons, CopyGuard, SiteEffects
│   │   │   ├── catalog/           # ProductCard, ProductListing, ProductGallery, PriceTag, Pagination
│   │   │   ├── news/              # PostCard
│   │   │   ├── sections/          # Section CMS: mỗi thư mục = 1 component (QUY ĐỊNH: sections/README.md)
│   │   │   ├── ui.tsx             # Class Tailwind đặt tên + Eyebrow, PageHero, CtaBand (site dùng chung)
│   │   │   ├── forms.tsx          # ConsultForm (yêu cầu tư vấn), ContactForm (client)
│   │   │   └── SectionRenderer.tsx
│   │   └── _lib/                  # cms.ts, catalog.ts (sản phẩm / danh mục), menu.ts, site-menu.ts (menu dự phòng), fallback.ts, sanitize.ts, seo.ts (buildPageMetadata)
│   ├── admin/                     # Dashboard CMS — URL: /admin/…
│   │   ├── layout.tsx             # AuthProvider + React Query + admin.css
│   │   ├── login/                 # /admin/login
│   │   ├── (protected)/           # Cần đăng nhập — layout.tsx bọc AdminShell
│   │   │   └── <feature>/         # products, product-categories, contacts (yêu cầu tư vấn + liên hệ), pages, page-sections, menus, blog-*, library, settings, contact-page, staffs, roles, permissions, dashboard
│   │   ├── _auth/                 # AuthProvider
│   │   ├── _layout/               # AdminShell, AdminSidebar, AdminProviders, navigation
│   │   ├── _components/           # data-table, generic-form, rich-text-editor, library-picker, image-compress-dialog, NotificationsBell…
│   │   └── _lib/                  # admin-api, crud-service, pagination, session, api-error, image-url, publish-status, format-date, confirm, seo-fields
│   ├── api/revalidate/            # Backend ping để drop fetch-cache khi admin sửa nội dung
│   ├── robots.ts                  # /robots.txt — chặn /admin, /api; trỏ sitemap
│   └── sitemap.ts                 # /sitemap.xml — trang tĩnh + trang CMS + danh mục + sản phẩm + bài viết (cache 1h)
├── components/ui/                 # UI primitives KHÔNG nghiệp vụ: Button, Badge, Card, Spinner, Modal (giữ sẵn, chưa nơi nào dùng)
├── api/api-fetch.ts               # Gọi backend từ server (site public): apiFetch
├── config/                        # routes.ts (BẢNG ĐƯỜNG DẪN — đổi URL ở đây), env.ts, contact.ts
├── settings/                      # Cài đặt site: site-settings.ts (getSiteSettings), brand-colors.ts, contact-page.ts
├── content/cms-fallback.json      # Nội dung dự phòng khi API lỗi — sinh bằng `npm run content:export` ở backend
├── media/                         # video-source.ts (YouTube/Vimeo/file)
├── utils/                         # Chỉ cn.ts + route.ts — không thêm file mới (xem .claude/rules/naming.md)
├── types/                         # Kiểu dữ liệu chung (cms.ts)
├── styles/                        # CSS theo layer — xem styles/README.md
└── fonts/                         # Barlow (woff2) + barlow-fonts.ts (next/font/local)
```

Quy ước đường dẫn: mọi `<Link>`, `router.push`, `redirect`, breadcrumb, sidebar đều lấy từ
`@/config/routes` (`adminRoutes.products.edit(id)`, `siteRoutes.category(slug)`…).
URL thật do tên thư mục trong `src/app` quyết định, nên đổi segment thì đổi cả 2 nơi.

SEO: metadata chia 3 tầng — `app/layout.tsx` chỉ có `metadataBase` + favicon;
`app/(site)/layout.tsx` đặt title template, description, Open Graph/Twitter mặc định
(ảnh lấy từ Cài đặt → ogImageUrl, fallback `public/images/hero/hero-1.webp`);
mỗi `page.tsx` gọi `buildPageMetadata()` trong `(site)/_lib/seo.ts` để lấy
metaTitle / metaDescription / ogImagePath / canonicalUrl từ CMS. Admin khai báo
`robots: noindex` ở `app/admin/layout.tsx`.

Quy ước import: dùng alias `@/…` (`@/app/(site)/_lib/cms`, `@/app/admin/_lib/api-error`);
file cùng thư mục dùng `./`. Service của feature này cần ở feature khác thì import
thẳng `@/app/admin/(protected)/<feature>/_lib/<x>.service`.

## Nối backend

- Menu header / footer: `GET /api/client/menu?location=header|footer` (fallback tĩnh khi lỗi)
- Trang: `GET /api/client/pages/:slug` (metadata + section sửa được từ admin); `GET /api/client/pages` (slug + updatedAt cho sitemap)
- Sản phẩm: `GET /api/client/products` (+ `/slug/:slug`), `GET /api/client/product-categories` (+ `/slug/:slug`)
- Tin tức: `GET /api/client/blog-posts` (+ `/slug/:slug`, categories) — lọc, phân trang
- Form tư vấn / báo giá / trả góp / lái thử / đại lý: `POST /api/client/quote-requests` · Form liên hệ: `POST /api/client/contact`
- Admin đăng nhập bằng tài khoản staff của backend (seed: admin@gmail.com / admin#123 — đổi ngay trên môi trường thật)

Site chỉ render tiếng Việt. Backend vẫn lưu và trả cột `translations` (bản dịch `en`, đọc qua `?lang=en`) nhưng admin
không còn ô sửa bản dịch; lưu form admin không gửi `translations` nên dữ liệu cũ trong DB giữ nguyên. Ảnh upload serve từ backend `/uploads`; ảnh mẫu của CMS cũng nằm ở `backend/uploads` (Thư viện); `public/images` chỉ giữ vài ảnh dự phòng dùng trong code (ghi công ở
`public/images/CREDITS.md`).
