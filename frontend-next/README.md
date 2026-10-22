# Prime Nuts USA — Frontend (Next.js)

Website + trang quản trị CMS cho Prime Nuts USA, dựng theo kiến trúc Next.js App Router
(Next.js 15 App Router, React 19) và nối với `backend/` (NestJS).

## Chạy

```
npm install        # hoặc đã có sẵn node_modules
npm run dev        # http://localhost:3005 (site) · /admin (quản trị)
npm run check      # typecheck + lint + lint:layers + lint:sections — chạy trước khi commit
npm run snapshot / shot / diff:png   # so HTML + ảnh trước/sau khi refactor — xem scripts/README.md
npm run build && npm start
```

Cấu hình `.env.local` (xem `.env.example`): `API_URL` / `NEXT_PUBLIC_API_URL`
trỏ về backend (`http://localhost:3012/api`), `REVALIDATE_SECRET` khớp backend.

## Cấu trúc

Theo chuẩn App Router: **route groups** `(group)` gom layout mà không đổi URL,
**private folders** `_folder` chứa code không phải route, đặt cạnh route dùng nó.

```
src/
├── app/
│   ├── layout.tsx                 # Root layout (metadata, styles/tailwind.css)
│   ├── (site)/                    # Site public — URL: / , /products, /news, /news/[slug], /contact, /[slug]
│   │   ├── layout.tsx             # Header (menu CMS) + Footer + SiteEffects
│   │   ├── _components/           # Xem _components/README.md
│   │   │   ├── layout/            # Khung trang: Header, Footer, Brand, SocialIcons, CopyGuard, SiteEffects
│   │   │   ├── sections/          # Section CMS: mỗi thư mục = 1 component (QUY ĐỊNH: sections/README.md)
│   │   │   ├── ui.tsx             # Class Tailwind đặt tên + Eyebrow, PageHero, CtaBand (site dùng chung)
│   │   │   ├── forms.tsx          # ContactForm, QuoteForm, NewsletterForm (client)
│   │   │   └── SectionRenderer.tsx
│   │   └── _lib/                  # cms.ts, menu.ts, sanitize.ts, site-menu.ts (fallback menu), seo.ts (buildPageMetadata)
│   ├── admin/                     # Dashboard CMS — URL: /admin/…
│   │   ├── layout.tsx             # AuthProvider + React Query + admin.css
│   │   ├── login/                 # /admin/login (+ _components/LoginScreen)
│   │   ├── (protected)/           # Cần đăng nhập — layout.tsx bọc AdminShell
│   │   │   └── <feature>/         # page.tsx, create/, edit/[id]/, _components/ (form, list), _lib/ (*.service.ts)
│   │   ├── _auth/                 # AuthProvider
│   │   ├── _layout/               # AdminShell, AdminSidebar, AdminProviders, navigation
│   │   ├── _components/           # data-table, generic-form, rich-text-editor, library-picker, image-compress-dialog…
│   │   └── _lib/                  # admin-api, crud-service, pagination, session, api-error, image-url, publish-status, format-date, confirm, seo/translation-fields
│   ├── api/revalidate/            # Backend ping để drop fetch-cache khi admin sửa nội dung
│   ├── robots.ts                  # /robots.txt — chặn /admin, /api; trỏ sitemap
│   └── sitemap.ts                 # /sitemap.xml — trang tĩnh + danh mục + bài viết (cache 1h)
├── components/ui/                 # UI primitives KHÔNG nghiệp vụ, dùng chung site + admin: Button, Badge, Card, Spinner, Modal
├── api/api-fetch.ts               # Gọi backend từ server (site public): apiFetch
├── config/                        # routes.ts (BẢNG ĐƯỜNG DẪN — đổi URL ở đây), env.ts, i18n.ts, markets.ts, contact.ts, products.ts
├── settings/                      # Cài đặt site: site-settings.ts (getSiteSettings), brand-colors.ts, contact-page.ts
├── media/                         # video-source.ts (YouTube/Vimeo/file), gallery-orientation.ts
├── utils/                         # Chỉ cn.ts + route.ts — không thêm file mới (xem .claude/rules/naming.md)
├── types/                         # Kiểu dữ liệu chung (cms.ts)
├── styles/                        # CSS theo layer — xem styles/README.md
└── fonts/                         # Barlow / Barlow Condensed (woff2) + barlow-fonts.ts (next/font/local)
```

Quy ước đường dẫn: mọi `<Link>`, `router.push`, `redirect`, breadcrumb, sidebar đều lấy từ
`@/config/routes` (`adminRoutes.blogPosts.edit(id)`, `siteRoutes.newsCategory(slug)`…).
URL thật do tên thư mục trong `src/app` quyết định, nên đổi segment thì đổi cả 2 nơi.

SEO: metadata chia 3 tầng — `app/layout.tsx` chỉ có `metadataBase` + favicon;
`app/(site)/layout.tsx` đặt title template, description, Open Graph/Twitter mặc định
(ảnh lấy từ Cài đặt → ogImageUrl, fallback `public/images/hero-branch.jpg`);
mỗi `page.tsx` gọi `buildPageMetadata()` trong `(site)/_lib/seo.ts` để lấy
metaTitle / metaDescription / ogImagePath / canonicalUrl từ CMS. Admin khai báo
`robots: noindex` ở `app/admin/layout.tsx`.

Quy ước import: dùng alias `@/…` (`@/app/(site)/_lib/cms`, `@/app/admin/_lib/api-error`);
file cùng thư mục dùng `./`. Service của feature này cần ở feature khác thì import
thẳng `@/app/admin/(protected)/<feature>/_lib/<x>.service`.

## Nối backend

- Menu header: `GET /api/client/menu` (fallback tĩnh khi lỗi)
- Trang: `GET /api/client/pages/:slug` (metadata + nội dung sửa được từ admin)
- News: `GET /api/client/blog-posts` (+ `/slug/:slug`, categories) — lọc, phân trang
- Form báo giá: `POST /api/client/quote-requests` · Form liên hệ: `POST /api/client/contact`
- Admin đăng nhập bằng tài khoản staff của backend (seed: admin@gmail.com / admin#123)

Site render tiếng Anh (bản dịch phụ 'vi' qua cột translations). Ảnh bài viết
serve từ backend `/uploads`; ảnh tĩnh của site nằm trong `public/images`.
