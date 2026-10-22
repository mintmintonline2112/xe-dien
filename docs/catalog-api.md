# Danh mục sản phẩm — hợp đồng API (backend ⇄ frontend)

Tài liệu chốt dữ liệu dùng chung cho 3 khu: backend (`backend/`), trang quản trị (`frontend-next/src/app/admin`) và
site public (`frontend-next/src/app/(site)`). Đổi field ở đây thì đổi cả 3 nơi.

## Ngôn ngữ

Nội dung gốc là **tiếng Việt** (`vi`). Bản dịch phụ duy nhất là `en`, lưu trong cột JSON `translations: { en: {...} }`,
truy vấn qua `?lang=en`. Site public chỉ render tiếng Việt.

## ProductCategory — bảng `product_categories`

| Field | Kiểu | Ghi chú |
|---|---|---|
| `id`, `sortOrder`, `createdAt`, `updatedAt`, `deletedAt` | BaseEntity | |
| `name` | string(255) | Tên hiển thị |
| `slug` | string(255), unique | URL `/danh-muc/<slug>` |
| `parentId` | int \| null | Cây 2 cấp (danh mục cha → con), FK SET NULL |
| `description` | text \| null | Đoạn giới thiệu đầu trang danh mục (HTML hoặc văn bản thường) |
| `imagePath` | string(500) \| null | Ảnh ô danh mục: `/images/...` (tĩnh) hoặc `uploads/...` |
| `icon` | string(40) \| null | Key icon: `bike`, `moped`, `kick-scooter`, `tricycle`, `car`, `kid`, `truck`, `battery`, `charger`, `forklift`, `bus`, `golf`, `tire`, `parts` |
| `isActive` | boolean, mặc định true | |
| `metaTitle`, `metaDescription`, `ogImagePath`, `canonicalUrl` | SEO | |
| `translations` | json \| null | `{ en: { name, description, metaTitle, metaDescription } }` |

## Product — bảng `products` (kế thừa SeoContentEntity: `title`, `slug` unique, `status`, meta SEO)

| Field | Kiểu | Ghi chú |
|---|---|---|
| `categoryId` | int \| null | FK `product_categories`, SET NULL |
| `sku` | string(64) \| null | Mã sản phẩm |
| `brand` | string(120) \| null | Thương hiệu (Vnbike, YAKA, Pega…) |
| `price` | int unsigned \| null | Giá bán (VNĐ). `null` = hiển thị "Liên hệ" |
| `originalPrice` | int unsigned \| null | Giá gốc (gạch ngang). Chỉ hiện khi > `price`; % giảm do frontend tự tính |
| `badge` | string(40) \| null | Nhãn góc ảnh: "Bán chạy", "Mới", "Trả góp 0%"… |
| `stockStatus` | `'in_stock' \| 'pre_order' \| 'out_of_stock'`, mặc định `in_stock` | Còn hàng / Đặt trước / Hết hàng |
| `isFeatured` | boolean, mặc định false | Khối "Sản phẩm mua nhiều" |
| `excerpt` | text \| null | Mô tả ngắn dưới tên |
| `content` | longtext \| null | Bài mô tả chi tiết (HTML từ trình soạn thảo) |
| `thumbnailPath` | string(500) \| null | Ảnh đại diện |
| `gallery` | json `string[]` \| null | Ảnh phụ (đường dẫn như `thumbnailPath`) |
| `specs` | json `{ label: string; value: string }[]` \| null | Bảng thông số kỹ thuật |
| `highlights` | json `string[]` \| null | Điểm nổi bật (gạch đầu dòng) |
| `promotion` | text \| null | Hộp khuyến mãi riêng của sản phẩm (văn bản, mỗi dòng 1 ưu đãi) |
| `warranty` | string(255) \| null | VD "Bảo hành 24 tháng động cơ, 12 tháng pin" |
| `publishedAt` | datetime \| null | |
| `translations` | json \| null | `{ en: { title, excerpt, content, metaTitle, metaDescription } }` |
| `metadata` | json \| null | Mở rộng sau này |

Ghi qua FormData (khi có file upload) thì `gallery`, `specs`, `highlights`, `translations`, `metadata` đến backend dạng
chuỗi JSON, boolean dạng `"true"/"false"` — DTO phải parse.

## API công khai (site) — cache namespace `client:products`, tag revalidate `products`

| Route | Trả về |
|---|---|
| `GET /api/client/product-categories` | `ProductCategory[]` đang bật, sắp theo `sortOrder, id`, mỗi phần tử kèm `productCount` (số sản phẩm đã xuất bản trong danh mục + danh mục con) |
| `GET /api/client/product-categories/slug/:slug` | `ProductCategory` + `parent` + `children[]` (đang bật), hoặc `null` |
| `GET /api/client/products` | `{ data: Product[], meta: { total, page, limit, totalPages } }` |
| `GET /api/client/products/slug/:slug` | `Product` kèm `category` (+ `category.parent`), hoặc `null` |

Tham số `GET /api/client/products`: `page`, `limit` (≤ 60), `category=<slug>` (gồm cả danh mục con), `featured=1`,
`search` (tìm trong `title`, `brand`, `sku`), `brand`, `exclude=<id>`, `sort=newest|price_asc|price_desc|featured|name`
(mặc định `featured`: `isFeatured DESC, sortOrder ASC, publishedAt DESC`). Chỉ trả sản phẩm `status = published` và
`publishedAt ≤ hiện tại` (hoặc null). Danh sách trả kèm `category` (id, name, slug).

## API quản trị

`/api/admin/products` và `/api/admin/product-categories` theo `BaseController` (danh sách phân trang + `search`,
`orderBy`, chi tiết, tạo, sửa, xoá mềm, `PATCH sort/:id`). Lọc được: products → `status`, `categoryId`, `isFeatured`,
`stockStatus`; categories → `isActive`, `parentId`. Tìm: products → `title`, `sku`, `brand`; categories → `name`.
Ảnh đại diện sản phẩm nhận file upload ở field `thumbnailPath` (giống ảnh bìa blog) hoặc chuỗi đường dẫn từ Thư viện.

## Yêu cầu tư vấn — bảng `quote_requests` (giữ tên bảng / module `quote-requests`)

| Field | Kiểu | Ghi chú |
|---|---|---|
| `fullName` | string(255) | bắt buộc |
| `phone` | string(30) | bắt buộc |
| `email` | string(255) \| null | |
| `province` | string(120) \| null | Tỉnh / thành |
| `requestType` | `'consult' \| 'quote' \| 'installment' \| 'test_ride' \| 'dealer'` | Tư vấn chọn xe / Báo giá / Mua trả góp / Xem xe – lái thử / Đăng ký đại lý |
| `productId` | int \| null | Sản phẩm đang xem (không FK) |
| `productName` | string(255) \| null | |
| `message` | text \| null | |
| `sourceUrl` | string(500) \| null | Trang gửi form |
| `status` | giữ enum trạng thái cũ (new → …) | |

`POST /api/client/quote-requests` nhận các field trên (trừ `status`).

## Menu

`menu_items.location`: `'header' | 'footer'` (mặc định `header`). `GET /api/client/menu?location=footer` trả cây menu
footer (cấp 1 = tiêu đề cột, cấp 2 = link). Không truyền `location` = `header`.
