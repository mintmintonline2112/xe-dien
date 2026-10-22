# Đặt tên

Nguyên tắc chung: **đọc tên là biết nó làm gì**, không cần mở code hay đọc comment. Tên trong code viết bằng tiếng Anh;
chữ hiển thị cho người xem, comment đầu file và tài liệu viết tiếng Việt.

## Hàm

| Loại hàm | Mẫu tên | Ví dụ đạt |
|---|---|---|
| Làm một việc (có tác dụng: ghi, nạp, gửi, render) | động từ + đối tượng | `loadVideoFont`, `saveIssue`, `renderReelStill`, `migrateReelDesign` |
| Tính ra giá trị từ dữ liệu (không tác dụng phụ) | động từ `get` / `build` / `find` / `count` + đối tượng, hoặc `xxxOf(input)` | `buildReelPalette`, `findSampleTexts`, `reelDesignOf(data)` |
| Trả về đúng / sai | `is` / `has` / `can` / `should` + điều kiện | `isReelIssue`, `hasLegacyReelDesign`, `canExport` |
| Đổi dạng dữ liệu | `to` + dạng đích, hoặc `parse` / `format` | `toRgbString`, `parseDeadline`, `formatVnDate` |
| Kiểm tra hợp lệ | `validate` + đối tượng, trả danh sách lỗi | `validateIssueData`, `validateReelConfig` |
| React component | danh từ PascalCase, tên cái hiện ra | `SampleTextBar`, `DesignPanel`, `ReasonsFlip` |
| React hook | `use` + việc nó lo | `useRenderJob`, `usePublishGuard` |
| Xử lý sự kiện trong component | `handle` + sự kiện (bên trong), `on` + sự kiện (tên prop) | `handleColorChange`, `onChange` |

Không đạt → đạt (tên cũ trong dự án, đã đổi trong đợt dọn 09/2026):

| Tên cũ | Vì sao chưa đạt | Tên mới |
|---|---|---|
| `tw(f, f0, f1, v0, v1)` | viết tắt, không đoán được | `tweenValue` |
| `spr(f, start, cfg)` | viết tắt | `springProgress` |
| `sec(s)` | không rõ đổi gì sang gì | `secondsToFrames` |
| `W(from, to)` | 1 chữ cái | `weightRange` |
| `rgbOf(hex)` | tên nói "của", thực ra là đổi dạng | `hexToRgbString` |
| `templateTextsIn(issue)` | danh từ, không có động từ | `findSampleTexts` |
| `ensureLookFonts` | "ensure" mơ hồ | `loadLookFonts` |

## Biến và tham số

- Tên đủ nghĩa: `frame` thay `f`, `startFrame` thay `f0`, `palette` thay `p`, `section` thay `s`.
- Được dùng tên ngắn quen thuộc: `i` / `j` (chỉ số vòng lặp), `e` (event), `x` / `y`, `id`, `url`, `fps`, `px`, `ms`.
- Boolean đặt như câu hỏi đúng / sai: `isOpen`, `hasImage`, `showSubtitles`.
- Mảng dùng số nhiều: `sections`, `fontChoices`; phần tử dùng số ít: `section`, `fontChoice`.
- Hằng số cố định cấp module: `UPPER_SNAKE_CASE` (`DESIGN_FPS`, `FONT_CHOICES`).
- Kiểu / type: danh từ PascalCase (`IssueData`, `ReelPalette`, `FontLoadSpec`).

## File

| Loại file | Cách đặt | Ví dụ |
|---|---|---|
| React component | PascalCase, trùng tên component export chính | `SampleTextBar.tsx` export `SampleTextBar` |
| Bố cục thứ 2 của một cảnh | tên cảnh + tên bố cục | `ReasonsFlip.tsx`, `HookChat.tsx`, `QuotePhoto.tsx` |
| React hook | `use` + tên, camelCase | `useRenderJob.ts` |
| Module / tiện ích / service | kebab-case, gồm lĩnh vực + việc chính | `font-loaders.ts`, `issue-service.mjs`, `section-heading.mjs` |
| Cấu hình dữ liệu | kebab-case `.json`, tên là thứ nó chứa | `template-samples.json`, `vn-places.json` |
| Test (khi repo có test) | tên tính năng + `.test.mjs` | `sample-text.test.mjs`, `fonts.test.mjs` |

- Một file làm một việc chính; tên file nói việc đó. Không đặt `helpers.ts`, `misc.ts`, `common.ts`, `stuff.mjs`.
- Đổi tên file chỉ khác hoa / thường (vd `sketches.tsx` → `Sketches.tsx`) phải dùng `git mv` — Windows không phân biệt hoa thường
  nhưng CI (Linux) thì có.

## Thư mục

- Tên số nhiều, theo vai trò của thứ bên trong: `components`, `scenes`, `hooks`, `services`, `routes`, `models`.
- Thư mục theo lĩnh vực thì dùng tên lĩnh vực: `reel`, `theme`, `scenes/news`, `scenes/testimonial`.
- Không tạo thư mục mới tên `utils`, `lib`, `misc`, `common`. Hàm dùng chung đặt cạnh lĩnh vực của nó
  (vd cài đặt site → `frontend-next/src/settings/`, hằng số / cấu hình → `src/config/`, gọi backend → `src/api/`,
  đọc dữ liệu CMS cho site → `app/(site)/_lib/`). Thư mục `frontend-next/src/utils` (cn, route) đang có giữ nguyên, không
  thêm file mới vào; không tạo lại `src/lib`.

## Dữ liệu và key

- Key trong JSON / data theo đúng quy ước hiện có: camelCase cho field (`issueDate`, `headingWeight`), kebab-case cho
  key định danh (`reel-hook`, `big-number`, `tin-1`).
- Key định danh do người soạn đặt (section key, slug) được dùng tiếng Việt không dấu: `tin-1`, `bang-gia`, `dem-nguoc`.
