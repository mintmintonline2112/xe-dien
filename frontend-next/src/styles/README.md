# `src/styles` — CSS của frontend

Giao diện site public viết bằng class Tailwind ngay trong JSX. Ngoài utilities chỉ còn vài file CSS, mỗi file một
layer. **Thứ tự layer là điều quan trọng nhất**: layer đứng sau thắng layer đứng trước, bất kể specificity.

| File | Layer | Chứa gì |
|---|---|---|
| `tailwind.css` | — | Điểm vào: khai thứ tự layer, nạp các file dưới, ánh xạ token sang theme Tailwind |
| `base.css` | `base` | Design token (`:root`) + reset theo **tên thẻ** (h1–h4, p, ul, a, img…). Không đặt rule theo `.class` ở đây |
| `components.css` | `components` | Class thật cho HTML do CMS sinh ra, không mang được class Tailwind: `.btn*`, `.post-content` |
| (utilities) | `utilities` | Class Tailwind trong JSX |
| `effects.css` | `effects` | Trạng thái hiệu ứng do JS bật / tắt (`.reveal` → `.is-visible`…) + keyframes |
| `admin.css` | — | Giao diện trang quản trị (chỉ `app/admin/layout.tsx` nạp) |

## Thứ tự layer

- `base`, `components` nằm **trước** utilities: class Tailwind luôn đè được (`<a className="btn btn-gold ml-3">`,
  `<p className="m-0">`), không cần hậu tố `!`.
- `effects` nằm **sau** utilities, có chủ đích: đó là trạng thái lúc chạy (ẩn chờ cuộn tới, trễ so le…), giống style
  inline JS gán vào, phải thắng class tĩnh. Hệ quả: **đừng đặt `opacity` / `transform` / `transition` lên phần tử có
  `.reveal` hoặc con trực tiếp của `.reveal-group`**, effects sẽ nuốt im lặng. Cần hiệu ứng hover thì đặt lên phần tử
  con. `npm run lint:layers` dò lỗi này.
- Không nạp preflight của Tailwind; reset nằm trong `base.css`.

## Design token (`base.css` + `tailwind.css`)

- **Màu thương hiệu**: 4 màu gốc `--brand-*` (chỉnh ở Admin → Cài đặt → Màu thương hiệu; layout `(site)` chèn
  `:root { --brand-*: … }` đè mặc định). Mọi sắc độ tự suy ra bằng `color-mix`. Tên `navy-*` giữ từ bản cũ, giá trị
  thật là sắc độ của `--brand-primary` (700 = đúng màu gốc); `gold-400` = đúng `--brand-secondary`.
- **Font**: `--font-main` (thân bài, mặc định Roboto), `--font-display` (h1–h3 + số lớn, mặc định Montserrat). Đổi sang
  font Google khác thì thêm vào link font trong `src/app/layout.tsx`.
- **Thang thiết kế** (`@theme static` trong `tailwind.css`) thay hẳn thang mặc định của Tailwind cho cỡ chữ, giãn chữ,
  khoảng cách dòng. Viết `text-sm`, `tracking-md`, `leading-relaxed`…; **không** viết giá trị tuỳ ý kiểu
  `text-[0.93rem]`. Cỡ chữ cố ý không kèm line-height. Thêm / đổi tên mốc thì cập nhật luôn `src/utils/cn.ts`
  (tailwind-merge).
- **Khoảng cách**: thang số mặc định, bước 0,25rem. Bốn tên gọi khác: `sm` = 0.5rem (= 2), `md` = 1rem (= 4),
  `lg` = 1.5rem (= 6), `xl` = 2rem (= 8), nên `pt-md` và `pt-4` ra cùng kết quả.
- **Bóng đổ theo vai trò**: `shadow-soft`, `shadow-lift`; `badge` (huy hiệu, chip nổi trên ảnh), `float` (menu thả,
  form, hộp thoại), `glow` / `glow-lg` (quầng vàng quanh ghim bản đồ). Viền focus dùng `ring-*`.
- **Khung nội dung**: class `site-container`, không đặt tên `container` (trùng utility có sẵn của Tailwind, lệch layout
  ở màn trung bình).
- Hoa văn tia sét và hạt phim cho dải nền đậm: `--pattern-volt`, `--texture-grain` (dùng qua `NAVY_PATTERN`,
  `NAVY_GRAIN` trong `_components/ui.tsx`).

## Móc hiệu ứng (`effects.css`, do `SiteEffects.tsx` điều khiển)

| Móc | Tác dụng |
|---|---|
| `.reveal` | Phần tử trồi lên khi cuộn tới |
| `.reveal-group` | Các con trực tiếp trồi lên lần lượt; đặt cùng `.reveal` hoặc nằm trong một `.reveal` |
| `data-stagger="N"` | Mỗi con trễ thêm N ms |
| `.eyebrow` | Gạch vàng dưới eyebrow tự vẽ ra khi khối hiện |
| `.photo-frame` | Ảnh phóng nhẹ rồi thu về; GSAP mở khẩu độ + trượt dọc theo cuộn |

Chỉ ẩn khi có JS (`html.js`), người tắt JS vẫn thấy đủ nội dung. Tailwind chỉ gọi được **tên** animation
(`animate-[faq-in_300ms_var(--ease)_both]`), nên keyframes khai trong `effects.css`: `arc-flow` / `pin-pulse` (bản
đồ), `amr-in` (danh sách nước), `ps-dash` (đường nối bước), `hs-in` (hero slider), `faq-in` (FAQ, thẻ toggle),
`marquee-*`, `doc-ring-spin`, `floaty`. Class `copy-guard` (bật từ Admin → Cài đặt) chặn bôi đen chữ, riêng ô nhập liệu
vẫn chọn được.

## `admin.css` — chỗ dễ làm hỏng

- Hộp thoại SweetAlert xoá file cần thêm `body` vào selector để đủ độ ưu tiên; swal dựng chữ bằng `textContent` nên
  ký tự xuống dòng bị nuốt.
- Nút chính kèm `.admin-root` trong selector để thắng rule `.admin-root button { color: inherit }`.
