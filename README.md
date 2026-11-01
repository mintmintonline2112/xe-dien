# Xe Điện Xanh — website bán xe điện

Website bán lẻ xe điện (xe đạp điện, xe máy điện, scooter, xe 3 bánh, ô tô điện, xe chuyên dụng / xe nâng điện, phụ tùng,
trạm sạc) kèm trang quản trị CMS. Dựng trên khung code của dự án primenutusa: NestJS + Next.js, nội dung trang ghép từ các
section quản lý trong admin.

> Tên thương hiệu, số điện thoại, địa chỉ showroom, sản phẩm và bài viết hiện là **dữ liệu mẫu** — chủ cửa hàng sửa trong
> Admin (Cài đặt, Trang Liên hệ, Sản phẩm, Trang) trước khi chạy thật. Ảnh trong `frontend-next/public/images` là ảnh minh hoạ
> từ Wikimedia Commons (giấy phép CC / public domain, ghi công ở `public/images/CREDITS.md` — giữ link ghi công ở footer
> cho tới khi thay hết bằng ảnh thật).

## Cấu trúc

```
xe-nang/
├── backend/        # NestJS 11 + TypeORM/MySQL — API CMS, sản phẩm, danh mục, tin tức, yêu cầu tư vấn (xem backend/README.md)
├── frontend-next/  # Next.js 15 — site public tiếng Việt + trang quản trị /admin (xem frontend-next/README.md)
├── catalog-importer/ # CLI độc lập: cào danh mục sản phẩm từ site khác + đẩy vào CMS qua API admin (xem catalog-importer/README.md)
├── docs/           # catalog-api.md: hợp đồng dữ liệu sản phẩm / danh mục / yêu cầu tư vấn giữa backend và frontend
├── .claude/rules/  # quy tắc code (comment, đặt tên) — bắt buộc khi sửa code
└── deploy.sh       # deploy VPS bằng một lệnh (pm2: xedien_api :3018, xedien_web :3008)
```

## Chạy trên máy dev

1. **Backend:** `cd backend`, tạo `.env` từ `.env.example` (DB `xedien`, JWT), tạo database rồi
   `npm install`, `npm run db:run && npm run db:seed`, `npm run start:dev`
   → API `http://localhost:3018/api`, Swagger `/docs`
2. **Frontend:** `cd frontend-next`, tạo `.env.local` từ `.env.example`, `npm install && npm run dev`
   → site `http://localhost:3008`, quản trị `/admin` (đăng nhập seed: admin@gmail.com / admin#123 — đổi mật khẩu ngay)

Làm mới toàn bộ dữ liệu mẫu: `cd backend && npm run db:fresh && npm run content:export`.

## Trang của site

| URL | Nội dung |
|---|---|
| `/` | Trang chủ: banner, ô ưu đãi, sản phẩm mua nhiều, danh mục, sản phẩm mới, khối theo danh mục, cam kết, tin tức, hỏi đáp, showroom, form tư vấn |
| `/san-pham` | Tất cả sản phẩm, tìm kiếm `?q=`, sắp xếp, phân trang |
| `/danh-muc/<slug>` | Sản phẩm theo danh mục (gồm danh mục con) |
| `/san-pham/<slug>` | Chi tiết: ảnh, giá + trả góp, khuyến mãi, thông số, form tư vấn gắn sản phẩm, sản phẩm liên quan |
| `/tin-tuc`, `/tin-tuc/<slug>` | Tin tức, hướng dẫn, khuyến mãi |
| `/lien-he` | Thông tin liên hệ, form, danh sách showroom |
| `/<slug>` | Trang CMS: giới thiệu, mua trả góp, hệ thống showroom, chính sách bảo hành / vận chuyển / đổi trả, tuyển dụng… |

## Quản trị (`/admin`)

Sản phẩm, danh mục sản phẩm, nhập sản phẩm từ website khác (Sản phẩm → Nhập từ website, chạy `catalog-importer/`), trang + section (kéo thả bố cục), menu (header / footer), bài viết, thư viện ảnh,
yêu cầu tư vấn + liên hệ (xuất Excel), cài đặt (logo, màu thương hiệu, SEO), trang liên hệ (hotline, Zalo, Messenger),
nhân viên và phân quyền.

## Kiểm tra trước khi commit

| Sửa ở đâu | Lệnh |
|---|---|
| `frontend-next/` | `npm run check` (typecheck + ESLint + lint:layers + lint:sections) |
| `backend/` | `npx tsc --noEmit -p tsconfig.json`, rồi `npm run build` |

## Deploy

`bash /www/wwwroot/xedienxanh.vn/deploy.sh` trên VPS (aaPanel + pm2). Chi tiết: đầu file `deploy.sh` và `backend/README.md`.
