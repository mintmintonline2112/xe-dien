# Xe Điện Xanh — Backend

CMS & API cho website bán xe điện Xe Điện Xanh (NestJS 11 + TypeORM/MySQL): **danh mục sản phẩm + sản phẩm**
(giá, thông số, ảnh, khuyến mãi), trang nội dung (pages/sections), tin tức (blog), menu header / footer, cài đặt
site, liên hệ và **yêu cầu tư vấn** (tư vấn chọn xe, báo giá, trả góp, lái thử, đăng ký đại lý), kèm RBAC
staff/roles/permissions.

- API prefix: `/api` — Swagger: `http://localhost:3018/docs` (cổng dev 3018; site Next.js 3008)
- Hợp đồng dữ liệu sản phẩm / danh mục / yêu cầu tư vấn / menu: [`docs/catalog-api.md`](../docs/catalog-api.md)
- Nội dung gốc **tiếng Việt**; bản dịch phụ `en` lưu ở cột JSON `translations` (`{ en: {...} }`), đọc qua `?lang=en`
- Đăng nhập admin (seed): `admin@gmail.com` / `admin#123` — đổi ngay trên môi trường thật

| Endpoint công khai (`@Public`) | Việc |
|---|---|
| `GET /api/client/products` | Danh sách sản phẩm: `page`, `limit` (≤ 60), `category=<slug>` (gồm danh mục con), `featured=1`, `search`, `brand`, `exclude=<id>`, `sort=featured\|newest\|price_asc\|price_desc\|name` |
| `GET /api/client/products/slug/:slug` | Chi tiết sản phẩm (kèm danh mục + danh mục cha) |
| `GET /api/client/product-categories` | Danh mục đang bật (gốc rồi tới các con) kèm `productCount` |
| `GET /api/client/product-categories/slug/:slug` | Một danh mục kèm `parent`, `children` |
| `GET /api/client/pages/:slug` | Trang + section đang bật |
| `GET /api/client/blog-posts` (+ `/slug/:slug`), `GET /api/client/blog-categories` | Tin tức |
| `GET /api/client/menu?location=header\|footer` | Cây menu theo vị trí (mặc định header) |
| `GET /api/client/settings` | Cài đặt site |
| `POST /api/client/quote-requests` | Gửi yêu cầu tư vấn (5 lần / phút / IP) |
| `POST /api/client/contact` | Gửi form liên hệ |

------------------------------------------------------------------------------------------------------------------------------------------------

### 1. Quy trình làm việc với Git (Git Flow)

Tuân thủ các bước dưới đây để đảm bảo an toàn dữ liệu, kiểm soát code khi dùng AI và tránh xung đột khi làm việc nhóm.

**Bước 1: Khởi tạo nhánh tính năng**
Luôn bắt đầu từ nhánh develop để lấy code mới nhất:
- git checkout develop
- git pull origin develop
- git checkout -b feature/ten-tinh-nang

**Bước 2: Kiểm soát Code khi dùng AI hỗ trợ**
Trong quá trình làm, nếu bạn đã hoàn thành một phần và muốn nhờ AI thực hiện tiếp nhưng sợ không kiểm soát được các thay đổi:
1. Chạy `git add .` để đánh dấu những phần bạn đã làm xong (Staged).
2. Sau khi AI thực hiện xong, review và test lại các file AI mới sửa so với phần đã add trước đó.
3. Nếu mọi thứ ổn định, tiếp tục `git add .` để tổng hợp tất cả.

**Bước 3: Cập nhật code và xử lý xung đột (Conflict)**
Trước khi push code lên, phải đảm bảo code tương thích với bản mới nhất trên server:
1. Chạy `git add .` sau đó `git stash` để cất tạm code hiện tại vào bộ nhớ đệm.
2. Chạy `git pull origin develop` để lấy code mới nhất về.
3. Chạy `git stash pop` để đưa code đang cất ra lại.
4. Nếu báo Conflict: Mở VS Code để xử lý các đoạn bị trùng lặp, sau đó `git add .` để xác nhận.

**Bước 4: Commit và Push**
Sau khi đã xác nhận mọi file sửa đổi bằng `git add .`
- git commit -m "feat: mô tả ngắn gọn tính năng"
- git push origin feature/ten-nhanh-cua-ban

**Bước 5: Tạo Pull Request (PR)**
1. Truy cập github.com, vào mục Pull Request -> New Pull Request.
2. Chọn ô Base là **develop**, ô Compare là **feature/ten-nhanh-cua-ban**.
3. Bấm Create Pull Request và chờ Review.

**Lưu ý quan trọng:**
- Tuyệt đối không tự ý Merge code.
- Mọi thay đổi sẽ được kiểm tra và test kỹ lưỡng trước tiến hành Merge vào nhánh chính.

------------------------------------------------------------------------------------------------------------------------------------------------

### 2. Cấu trúc thư mục
   Tất cả mã nguồn nằm trong thư mục src và tuân thủ các quy tắc sau:

common/base/
Nơi chứa base.entity.ts và base.service.ts. Mọi Entity và Service mới bắt buộc phải kế thừa từ các lớp cơ sở này.

configs/
Chứa file app.config.ts quản lý toàn bộ biến môi trường. Tuyệt đối không gọi process.env trực tiếp trong mã nguồn.

constants/
Chứa app.constant.ts để quản lý tập trung các biến tĩnh, Enum và thông báo lỗi.

database/
Bao gồm migrations, seeders và data-source.ts. Đây là nơi quản lý cấu trúc và dữ liệu mẫu của cơ sở dữ liệu.

modules/
Chia theo từng tính năng như Users, Roles, Staffs. Mỗi folder là một module độc lập và phải được đăng ký vào admin.module.ts (hoặc app.module.ts).

seed.ts
File thực thi riêng để đổ dữ liệu mẫu từ terminal, chạy độc lập với ứng dụng chính.

------------------------------------------------------------------------------------------------------------------------------------------------

### 3. Hệ thống Scripts
   Sử dụng lệnh npm run [tên_lệnh] để tương tác với hệ thống qua terminal.

Trước khi chạy migrations/seed lần đầu:
- Cấu hình `backend/.env` (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, ...)
- Tạo database `DB_NAME` trên DB server nếu chưa có

Quản lý cấu trúc bảng (Migrations)

- `npm run db:show`
  - Xem trạng thái các bản migration (đã chạy/chưa chạy).

- `npm run db:gen -- src/database/migrations/<TenMigration>`
  - Generate migration dựa trên thay đổi trong entity.
  - Ví dụ: `npm run db:gen -- src/database/migrations/AddStaffNewField`
  - Luôn mở file migration vừa tạo để review SQL trước khi chạy.

- `npm run db:create -- src/database/migrations/<TenMigration>`
  - Tạo migration rỗng để tự viết SQL/QueryRunner khi cần.

- `npm run db:run`
  - Chạy tất cả migration chưa chạy để tạo/cập nhật bảng trong database.

- `npm run db:revert`
  - Hoàn tác 1 migration gần nhất (rollback 1 bước).

Quản lý dữ liệu mẫu (Seeders)

- `npm run db:seed`
  - Đổ dữ liệu mẫu/mặc định (idempotent: nếu đã có dữ liệu thì bỏ qua).

Làm mới môi trường (Development)

- `npm run db:drop`
  - Xoá toàn bộ schema (tất cả bảng).

- `npm run db:fresh`
  - Reset toàn bộ: `db:drop` -> `db:run` -> `db:seed`.

Tình huống: bảng đang bình thường, thêm 1 field mới vào `staffs`, muốn cập nhật bảng `staffs` cho mới nhất

1. Sửa entity `Staff` (thêm field).
2. Generate migration:
   - `npm run db:gen -- src/database/migrations/UpdateStaffTable`
3. Chạy migration:
   - `npm run db:run`

Các bảng khác có bị ảnh hưởng không?
- Thông thường **không**: migration sẽ chỉ `ALTER TABLE staffs ...`.
- Các bảng khác chỉ bị ảnh hưởng nếu bạn thay đổi quan hệ/constraint/index liên quan (foreign key, unique index, join table, ...).
- Bạn luôn có thể kiểm tra nội dung file migration trước khi chạy để biết chính xác nó động vào bảng nào.

Nếu bạn muốn “tạo lại bảng staffs từ đầu”:
- Không khuyến nghị vì sẽ mất dữ liệu và có thể ảnh hưởng ràng buộc khoá ngoại.
- Cách an toàn là dùng migration để `ALTER TABLE` (thêm/sửa cột).
- Nếu buộc phải recreate, hãy tạo migration thủ công để drop/create đúng ý, hoặc reset toàn DB bằng `npm run db:fresh` (sẽ ảnh hưởng tất cả bảng).

------------------------------------------------------------------------------------------------------------------------------------------------

### 4. Nguyên tắc phát triển
   Path Alias: Luôn sử dụng đường dẫn tuyệt đối bắt đầu từ src/. Không sử dụng đường dẫn tương đối ../../.

Entity: Đặt trong thư mục entities của từng module và bắt buộc kế thừa từ BaseEntity.

Module: Mọi module mới phải được khai báo vào admin.module.ts (admin) hoặc app.module.ts.

Database: Tuyệt đối không dùng synchronize: true. Mọi thay đổi cấu trúc bảng phải thực hiện qua Migration.

Clean Code: Sử dụng hằng số từ thư mục constants thay vì viết cứng giá trị vào logic xử lý.

------------------------------------------------------------------------------------------------------------------------------------------------

### 5. Ghi chú kỹ thuật (trước khi sửa các phần này)

Code theo quy tắc trong `.claude/rules/`: mỗi file chỉ có một khối comment đầu file, nên những điều cần biết dài hơn
nằm ở đây.

**Phiên đăng nhập admin** (`modules/admin/auth/auth.service.ts`)

| Thứ | Giá trị | Ghi chú |
|---|---|---|
| Access token | `JWT_ACCESS_EXPIRES` (mặc định 60m) | Cookie `accessToken`, chứa danh sách quyền |
| Refresh token | `JWT_REFRESH_EXPIRES` (mặc định 7d) | Chỉ chứa `id` + `sid` (mã phiên), không kèm quyền, cho cookie nhẹ |
| Hạn cứng một phiên | 30 ngày từ lúc đăng nhập | Hạn 7 ngày được đẩy lùi mỗi lần làm mới nên tự nó không bao giờ tới |
| Số phiên mỗi tài khoản | 10 | Vượt thì xoá phiên cũ nhất |
| Khoảng đệm khi xoay token | 10 giây | Hai tab cùng làm mới không bị coi là token bị đánh cắp |

- Bảng `staff_refresh_tokens`: một hàng = một phiên còn sống, xoá hẳn khi đăng xuất / hết hạn (dọn ngay trong luồng
  đăng nhập, không cần tác vụ định kỳ). Lưu SHA-256 của token, không dùng bcrypt (bcrypt chỉ băm 72 byte đầu).
- Token cũ dùng lại ngoài khoảng đệm: coi như phiên bị lộ và huỷ luôn. Khoá tài khoản: mất quyền ở lần làm mới kế tiếp.
- Đăng xuất luôn xoá cookie trước, nên cookie hỏng hay hết hạn vẫn đăng xuất được.

**Cài đặt site** (`modules/admin/settings/settings.service.ts`, bảng `site_settings`; giá trị mặc định ở `seeds/settings.seed.ts`)

| Key | Nghĩa |
|---|---|
| `brandName` | Chữ cạnh logo (seed: "Xe Điện Xanh") |
| `siteTitle`, `siteDescription` | Tiêu đề / mô tả SEO mặc định |
| `footerText` | Dòng cuối trang, sau "© <năm> " |
| `logoUrl`, `footerLogoUrl` | Cố ý không seed: chưa có logo thì site hiện biểu tượng SVG dựng sẵn + tên thương hiệu |
| `ogImageUrl` | Ảnh khi chia sẻ link (trống = ảnh bìa) |
| `brandColors` | `{ primary, secondary, black, white }` dạng #RRGGBB, đè màu gốc của site (seed: xanh lá `#0A7D4F`, vàng `#FFB81C`) |
| `showPostMeta`, `copyProtection` | Mặc định bật; `false` là tắt toàn site |
| `translations` | `{ en: { siteTitle, siteDescription, … } }`, ghép vào khi gọi `?lang=en` |
| `socialLinks` | Link mạng xã hội (facebook, youtube, instagram, tiktok, zalo) |
| `contactPage` | Trang Liên hệ: `hero`, `company` (name, address, location, phone, **hotline**, email, hours, mapUrl, **zalo**, **messenger**), `form` |
| `contactInfo`, `colorsDark`, `colorsLight`, `postTitleSize` | Key cũ, giữ để form gửi `null` xoá dữ liệu cũ không bị lỗi |

**Sản phẩm** (`modules/admin/products`, `modules/client/products`)

- `price` null = site hiện "Liên hệ"; `originalPrice` chỉ hiện khi lớn hơn `price`. Giá là `int unsigned` (VNĐ, tối đa ~4,29 tỷ).
- Admin gửi JSON (ảnh đại diện chọn từ Thư viện, dạng chuỗi đường dẫn). FormData (khi upload file ở field `thumbnailPath`)
  vẫn nhận: `gallery`, `specs`, `highlights`, `metadata` đến dạng chuỗi JSON, boolean dạng `"true"/"false"` — DTO tự parse.
- Lọc danh sách admin theo cột boolean (`isFeatured`, `isActive`) nhận `true/false/1/0` (BaseService tự đổi sang boolean).
- Ghi sản phẩm / danh mục xoá cache namespace `client:products` và báo Next.js bỏ tag `products`.

**Yêu cầu tư vấn** (`modules/admin/quote-requests`, giữ tên bảng `quote_requests`): `requestType` =
`consult | quote | installment | test_ride | dealer`; admin lọc `?status=` và `?requestType=`, xuất Excel
`GET /admin/quote-requests/export` (quyền `EXPORT`), đổi trạng thái `PATCH /admin/quote-requests/:id/status` (quyền
`UPDATE_STATUS`). Mail báo về `MAIL_FROM` (dữ liệu khách được escape HTML), thông báo admin trỏ `/admin/contacts`.

**Menu** (`menu_items.location` = `header | footer`): cây public lọc vị trí theo mục gốc, mục con đi theo cha. Footer: mục
gốc là tiêu đề cột (href dạng `#...`), mục con là link.

**Đồng bộ bố cục trang giữa 2 database** (`scripts/layout-sync/`)

- `npm run layout:export` (máy dev) → `layout-sync/layout.json`; `-- --pages=home,contact`, `-- --file=<đường dẫn>`.
  Commit + push file này.
- `npm run layout:import` (VPS) mặc định **chạy thử**, chỉ in kế hoạch. `-- --apply` mới ghi; `-- --pages=home`;
  `-- --update-content` ghi đè cả nội dung section đã có.
- Section chưa có trên VPS → tạo mới (qua kiểm tra metadata như admin); đã có → chỉ chỉnh bật / tắt + thứ tự; đã bị
  xoá trên VPS → bỏ qua; chỉ có trên VPS → giữ nguyên. Đều được báo lại.

**Seed nội dung** (`database/seeding/seeds/`) — mọi seed chỉ thêm cái còn thiếu, không đè chỉnh sửa của admin

- Thứ tự: quyền → vai trò → nhân viên → cài đặt → danh mục sản phẩm → sản phẩm → blog → trang → định nghĩa section → menu.
- `product-category.seed.ts` (9 danh mục gốc + 12 con, khớp theo slug), `product.seed.ts` (43 sản phẩm mẫu, ảnh
  `/images/products/<nhóm>-<số>.webp` của frontend), `settings.seed.ts` (khớp theo key), `menu.seed.ts` (khớp theo vị trí + href).
- Số điện thoại, địa chỉ, email trong seed là dữ liệu mẫu — thay trong Admin → Cài đặt / Trang Liên hệ.
- `page.seed.ts` là nguồn nội dung duy nhất của trang; seed chỉ bổ sung key metadata còn thiếu, không đè chỉnh sửa của admin.
  Sửa xong chạy `npm run content:export` để sinh lại `frontend-next/src/content/cms-fallback.json`.
- Mô tả slide hero là văn bản thường, xuống dòng 2 lần để tách đoạn.
- `section-definition.seed.ts`: danh sách chính của mỗi component là `items`; danh sách phụ giữ tên riêng (`stats`,
  `slides`, `sizes`, `chips`, `photos`). Seed upsert theo `sectionKey` và xoá định nghĩa không còn trong code.

**Cache** (`common/cache/`): mặc định lưu trong RAM. Chuyển sang Redis: `npm i @keyv/redis`, rồi dùng
`stores: [createKeyv(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379')]` trong `app-cache.module.ts`.

**Thư viện file** (`modules/admin/library/`): ảnh upload được nén về khoảng ≤ 1MB; danh sách thư mục và tổng dung
lượng tính trên toàn thư viện, không theo bộ lọc đang chọn.
