# `frontend-next/scripts` — công cụ kiểm tra, so sánh và xuất demo

| Lệnh | Script | Làm gì |
|---|---|---|
| `npm run check` | — | `typecheck` + `lint` + `lint:layers` + `lint:sections`; chạy trước khi commit |
| `npm run lint:layers` | `lint-layers.mjs` | Bắt class Tailwind bị layer `effects` nuốt im lặng |
| `npm run lint:sections` | `lint-sections.mjs` | Kiểm tra thư mục section theo `sections/README.md` |
| `npm run section:new -- <key> [--client]` | `new-section.mjs` | Tạo section mới từ `sections/_template`, ghi registry |
| `npm run snapshot -- <dir>` | `snapshot-pages.mjs` | Chụp HTML 4 trang public đã làm phẳng để `diff -r` |
| `npm run shot -- <dir>` | `shot-pages.mjs` | Chụp ảnh 4 trang × 2 bề ngang (1440, 390) |
| `npm run diff:png -- <A> <B> [--noise <A2>] [--out <dir>]` | `diff-png.mjs` | So pixel hai bộ ảnh |
| `node scripts/crop-png.mjs A.png B.png y h out.png [scale]` | `crop-png.mjs` | Cắt cùng một dải của 2 ảnh, ghép cạnh nhau để xem |
| `npm run export:demo -- <dir>` | `export-demo-site.mjs` + `demo-site-runtime.js` | Xuất cả site public (đang chạy ở 3006) thành thư mục HTML / CSS / JS tĩnh làm demo GitHub Pages |

## lint:layers

Kiến trúc layer: xem `src/styles/README.md`. Layer `effects` cố ý đặt **sau** utilities nên có thể nuốt class
Tailwind: `<article className="reveal transition-colors">` thì transition của `.reveal` thắng, class vẫn nằm trong DOM,
build vẫn xanh nhưng không có tác dụng.

Script đọc `src/styles/effects.css` (bỏ comment), lấy các thuộc tính mà rule theo từng class móc (`.reveal`…) đặt, rồi
dò mọi `className` trong `src/app/(site)`:

- `[BỊ NUỐT]` class Tailwind đặt cùng thuộc tính lên phần tử mang class móc đó.
- `[THỪA !]` hậu tố `!`: không còn layer nào cần đè bằng `!`.

Giới hạn: chỉ đọc chuỗi class viết thẳng trong `className` / `cn(...)`, không lần theo hằng số (`PHOTO_FRAME`…); không
biết phần tử nào là **con** của `.reveal-group`, nên đừng đặt opacity / transform / transition lên con trực tiếp của nó.
Sửa `[BỊ NUỐT]`: chuyển class lên phần tử con, hoặc bỏ nếu hiệu ứng hiện dần đã lo phần chuyển động.

## lint:sections

Lỗi cấu trúc (thoát mã 1):

| Mã | Quy tắc |
|---|---|
| S1 | Mỗi thư mục section (không bắt đầu bằng `_`) có đúng một file chính `<Pascal>.tsx`, kebab(Pascal) = tên thư mục, file export `function <Pascal>` |
| S2 | File chính không `"use client"`, dùng `anchorIdOf()`, import helper từ `"../_shared"` |
| S3 | File có `"use client"` mang đuôi `.client.tsx` và ngược lại |
| S4 | Không import chéo giữa hai thư mục section; `.client.tsx` chỉ được import trong thư mục của nó |
| S5 | Registry (`index.ts`) và thư mục khớp 1-1 (trừ `generic-block`, `_*`) |
| S6 | Không đọc `.metadata` trực tiếp ngoài `_shared/` |
| S7 | `_template/Example.tsx` tồn tại |

Bộ xương render (cũng là lỗi; `--no-strict` hạ xuống cảnh báo):

| Mã | Quy tắc |
|---|---|
| R1 | Dùng `<Shell>`, không có `<section>` viết tay |
| R2 | Dùng `<Head>`, không tự viết `<Eyebrow>` |
| R3 | Không tự viết số thứ tự 2 chữ số (dùng `formatOrdinal`) |

Ngoại lệ: khối đầu file chính ghi `lint-sections-ignore R2: <lý do>` (mỗi quy tắc một dòng); lý do được in ra trong
báo cáo.

## So sánh trước / sau khi refactor

1. Chạy site sạch: tắt dev server, xoá `.next` (cache fetch và chunk JSON cũ làm sai so sánh), `npm run dev`, gọi mỗi
   trang 2 lần cho biên dịch xong.
2. `npm run snapshot -- before` và `npm run shot -- before`, chụp ảnh thêm lần nữa vào `before-2` để làm `--noise`.
3. Sửa code, lặp lại bước 1, chụp vào `after`.
4. So HTML phần `<body>` (Next stream metadata trong `<head>` không ổn định): `diff -r`. So ảnh:
   `npm run diff:png -- before after --noise before-2 --out diff`.

- `snapshot-pages.mjs`: bỏ `<script>`, link `/_next/static` (hash đổi mỗi lần build), chuẩn hoá id do React `useId()`
  sinh, mỗi thẻ một dòng.
- `shot-pages.mjs`: Chrome headless (Edge trên Windows hay thoát mà không ghi file), PNG cao 12000px, bật
  `prefers-reduced-motion` để hiệu ứng không làm ảnh khác giữa hai lần chụp. Đổi trang / bề ngang bằng `SNAP_PATHS`,
  `SNAP_WIDTHS`, `SNAP_BASE`.
- `diff-png.mjs --noise`: hàng pixel khác nhau giữa A và các lần chụp cùng mã là nhiễu (marquee, vòng nét đứt xoay
  không tắt theo reduced-motion), gom thành dải (nối dải cách nhau dưới 24 hàng) và bỏ qua khi so A với B; dải bị bỏ
  được in ra. 48 hàng cuối ảnh luôn bỏ.
