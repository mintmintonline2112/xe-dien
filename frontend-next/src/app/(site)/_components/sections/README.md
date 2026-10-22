# QUY ĐỊNH viết section component

Đây là "basecode" của mọi khối nội dung trên site public. Mục tiêu: **section
mới viết y như section cũ**, ai đọc một section là đọc được tất cả. Kiểm tra tự
động: `npm run lint:sections` (chạy trong `npm run check`).

Mục lục: [1. Mô hình](#1-mô-hình) · [2. Thư mục & đặt tên](#2-thư-mục--đặt-tên) ·
[3. Bộ xương file chính](#3-bộ-xương-file-chính) · [4. Đọc dữ liệu](#4-đọc-dữ-liệu) ·
[5. Khối dựng sẵn](#5-khối-dựng-sẵn) · [6. Hiệu ứng reveal](#6-hiệu-ứng-reveal) ·
[7. Style](#7-style) · [8. File client](#8-file-client) · [9. Thêm section mới](#9-thêm-section-mới) ·
[10. Thêm bố cục mới](#10-thêm-bố-cục-mới) · [11. Kiểm tra](#11-kiểm-tra) · [12. Trạng thái chuyển đổi](#12-trạng-thái-chuyển-đổi)

---

## 1. Mô hình

- **Một component = một BỐ CỤC** (layout family), đặt tên theo **hình dạng**
  (`faq`, `media-cards`, `photo-strip`), không theo nội dung (`why-us`, `xe-dap-dien-ban-chay`).
- **Biến thể hiển thị = `metadata.layout`** (`faq: columns | split`). Đổi layout
  thì dữ liệu giữ nguyên, chỉ cách hiển thị đổi. Cần kiểu mới → thêm layout
  vào component có sẵn (mục 10); chỉ tạo component mới khi dữ liệu khác hẳn.
- **Nội dung chỉ nằm trong CMS / seed.** Component KHÔNG có chữ, ảnh, danh sách
  mặc định. Thiếu dữ liệu thì bỏ trống phần đó; không có gì để hiện thì `return null`.
- **`section_key` = id neo trên trang** (`/#about-map`), có thể khác tên component
  (một component đặt nhiều lần trên một trang). `metadata._component` = tên component.
- Section là **Server Component**. Phần cần JS (bấm, trượt, tab) tách thành file
  `.client.tsx` nhận dữ liệu thuần qua props.

## 2. Thư mục & đặt tên

```
sections/
├── README.md               quy định này
├── index.ts                REGISTRY: key → component; LEGACY_COMPONENTS: tên cũ → mới
├── _shared/                đồ dùng chung — import { … } from "../_shared"
│   ├── data.ts             SectionProps, textOf, textListOf, itemsOf, metaOf, layoutOf, anchorIdOf, formatOrdinal, alternatingTone…
│   ├── blocks.tsx          Shell, Head, Note, Cta, RichIntro, InlineNote, StatsList
│   └── icons.tsx           ICONS, iconFor, IconBadge
├── _template/              bản mẫu — KHÔNG trong registry, chỉ để copy
│   ├── Example.tsx
│   └── ExampleWidget.client.tsx
└── <key>/                  MỘT thư mục cho MỖI component
    ├── <Pascal>.tsx        file chính, Server Component, export function <Pascal>
    ├── <Tên>.client.tsx    (tuỳ chọn) phần tương tác — chỉ file chính cùng thư mục dùng
    └── <Tên>.tsx           (tuỳ chọn) mảnh server chỉ section này dùng (VD SizeRuler)
```

Bốn cái tên phải trùng nhau, ở bốn nơi:

| Nơi                                       | Ví dụ                               | Ghi chú                                                         |
| ----------------------------------------- | ----------------------------------- | --------------------------------------------------------------- |
| Tên thư mục                               | `icon-card-list`                    | kebab-case                                                      |
| Key trong `SECTION_COMPONENTS` (index.ts) | `"icon-card-list"`                  | = `metadata._component`                                         |
| `sectionKey` trong seed backend           | `'icon-card-list'`                  | `backend/src/database/seeding/seeds/section-definition.seed.ts` |
| Tên file chính + tên hàm export           | `IconCardList.tsx` / `IconCardList` | PascalCase của key                                              |

Cấm: file chính có `"use client"`; hai section import chéo nhau; file `.client.tsx`
được import từ ngoài thư mục của nó; đặt tên theo nội dung (`Promo…`, `XeDap…`).

## 3. Bộ xương file chính

Mọi file chính viết theo đúng thứ tự này (xem bản đầy đủ ở `_template/Example.tsx`):

```tsx
/**
 * Section `<key>`: một câu mô tả hình dạng; bố cục `grid` (…) hoặc `split` (…).
 * Dùng bởi: sections/index.ts (registry) qua SectionRenderer.
 * Lưu ý: CMS đọc heading, subheading, content, metadata.items [{title,text}], note, ctaLabel, ctaHref.
 */
import {
  Head,
  Note,
  Shell,
  alternatingTone,
  anchorIdOf,
  itemsOf,
  layoutOf,
  textOf,
  type SectionProps,
} from "../_shared";

const LAYOUTS = ["grid", "split"] as const;

export function Pascal({ section, index = 0 }: SectionProps) {
  const layout = layoutOf(section, LAYOUTS, "grid");
  const rows = itemsOf(section, "items");
  const id = anchorIdOf(section, "<key>");

  if (rows.length === 0 && !section?.heading) return null;

  return (
    <Shell id={id} tone={alternatingTone(index)}>
      <Head section={section} />
      {layout === "split" ? (
        <SplitBody rows={rows} />
      ) : (
        <GridBody rows={rows} />
      )}
      <Note
        text={textOf(section, "note")}
        cta={textOf(section, "ctaLabel")}
        href={textOf(section, "ctaHref")}
      />
    </Shell>
  );
}
```

Thứ tự trong thân: đọc dữ liệu (chỉ qua helper `_shared`) → không có gì để hiện thì `null` → khung `Shell`
→ đầu khối `Head` → thân theo layout → ghi chú + CTA (`Note`). Phần tử đầu của `LAYOUTS` là bố cục mặc định.
Comment theo `.claude/rules/comments.md`: đúng một khối đầu file, thân không comment.

Quy tắc bắt buộc:

1. Chữ ký đúng `({ section, index = 0 }: SectionProps)`; bỏ `index` nếu không dùng.
2. Một file = **một** `export function` trùng tên file. Thân theo từng layout là
   hàm nội bộ trong cùng file (`function GridBody`), không export.
3. **Chỉ một `<section>`**, và nó là `<Shell>`. Không viết `<section className={cn(SECTION…)}>` tay.
   Nền khác (ảnh mờ, hoa văn) → `backdrop`; nền riêng → `className`; tràn mép → `bleed`.
4. Đầu khối luôn là `<Head>`. Không tự ghép `<Eyebrow>` + `<h2>` + `<RichIntro>`
   — Head đã lo quy tắc ẩn eyebrow toàn site (`showEyebrow`). Trong cột của bố cục
   split: `<Head align="left" />` — không bọc div, cột chứa nó mang `reveal`.
5. Ghi chú + nút cuối khối luôn là `<Note>`; nút đứng một mình là `<Cta>`.
   Không viết `<a className="btn …">` tay; không lặp lại fallback `#tu-van`.
6. `id={anchorIdOf(section, "<key>")}`; mọi id phần tử con tạo bằng `useId()` (file client)
   hoặc ghép từ `id` của section — không hardcode chuỗi id.
7. Không có chữ, ảnh, alt mặc định trong code: mọi thứ NHÌN THẤY được đều là trường
   CMS (khai trong seed backend, có giá trị trong page.seed.ts). Thiếu dữ liệu thì ẩn
   phần đó, không thay bằng chữ cứng. Ngoại lệ duy nhất là nhãn trợ năng không hiện
   ra màn hình (`aria-label`, `sr-only`, VD "Previous slide"): ưu tiên lấy từ CMS nếu
   có trường hợp lý (heading của section), không thì để mặc định trong file client,
   lý do ghi ở mục "Lưu ý" của khối đầu file.
8. Không định nghĩa lại helper đã có trong `_shared` (`formatOrdinal`, `resolveImage`, `toHtml`…).
9. Số thứ tự hiển thị dùng `formatOrdinal(i)`; icon dùng `iconFor(row.icon, i)` + `<IconBadge>`.
10. File dưới **250 dòng**. Dài hơn → tách thân layout sang file `<Tên>.tsx` cùng thư mục.

## 4. Đọc dữ liệu

Chỉ đọc qua `_shared/data.ts`. **Cấm** `section.metadata.x`, `as any`, `as Record<…>` trong section.

| Hàm                                    | Trả về                         | Dùng cho                                                              |
| -------------------------------------- | ------------------------------ | --------------------------------------------------------------------- |
| `textOf(section, key)`                    | chuỗi đã trim hoặc `undefined` | chữ đơn: `note`, `ctaLabel`, `image`, `itemLabel`                     |
| `textListOf(section, key)`                | `string[]` sạch                | danh sách chuỗi: checklist, chips                                     |
| `itemsOf(section, key)`                  | `Array<Record<string,string>>` | danh sách object; chuỗi lẻ được nâng thành `{title,label}`            |
| `metaOf<T>(section, key)`              | `T \| undefined`               | cấu trúc đặc biệt (regions của about-map)                             |
| `layoutOf(section, LAYOUTS, fallback)` | layout hợp lệ                  | component có ≥ 2 bố cục; chỉ 1 bố cục thì bỏ `LAYOUTS` lẫn `layoutOf` |
| `anchorIdOf(section, "<key>")`           | id neo                         | `Shell id`                                                            |
| `alternatingTone(index)`                       | `"plain" \| "tint"`            | nền xen kẽ theo vị trí                                                |
| `formatOrdinal(i)`                               | `"01"`                         | số thứ tự                                                             |
| `resolveImage(path)`                   | URL ảnh                        | `/images/...` tĩnh hoặc upload phía API                               |
| `toHtml`, `splitParagraphs`, `toInlineHtml`   | HTML/đoạn                      | văn bản thường → HTML an toàn                                         |

Key metadata chuẩn (đặt đúng tên để form admin + seed dùng lại được):

| Key                           | Ý nghĩa                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `layout`                      | bố cục (select trong admin)                                                                                    |
| `itemsOf`                       | **danh sách chính** — luôn tên này. Danh sách phụ giữ tên riêng: `stats`, `slides`, `chips`, `photos`, `sizes` |
| `note`, `ctaLabel`, `ctaHref` | ghi chú cuối khối + nút                                                                                        |
| `headingAccent`               | phần tiêu đề tô màu (Head tự xử lý)                                                                            |
| `backdropImage`               | ảnh mờ lót nền của khối (Shell `backdrop`)                                                                     |
| `image` (+ `imagePosition`)   | ảnh lớn của khối; item có ảnh dùng `items[].image`                                                             |
| `itemLabel`                   | tiền tố nhãn số thứ tự ("Variety 01")                                                                          |
| `showEyebrow`                 | admin tick "Hiện eyebrow" — Head tự đọc                                                                        |

Trường của item: `title`, `text`, `label`, `value`, `icon`, `image`, `caption`, `alt`, `href`.
Thêm trường mới → khai trong `itemFields` của seed backend để form admin có ô nhập.

## 5. Khối dựng sẵn

`_shared/blocks.tsx` — ghép chúng lại, không viết lại.

| Khối                    | Props                                                                                        | Ghi chú                                                                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Shell`                 | `id`, `tone` plain/tint/dark, `flow`, `backdrop`, `bleed`, `className`, `containerClassName` | khung `<section>` + `.site-container`; `containerClassName` khi bố cục grid đặt ngay trên container; `className` có `py-…` riêng thì đè đệm chuẩn    |
| `Head`                  | `section`, `light`, `intro`, `align` center/left, `level` 1/2, `className`                   | eyebrow + heading + intro. `align="left"` KHÔNG bọc div (dùng trong cột đã có `reveal`). Tự đọc `metadata.headingAccent` để tô vàng một phần tiêu đề |
| `Note`                  | `text`, `cta`, `href`, `light`                                                               | ghi chú in nghiêng + nút; rỗng thì không render                                                                                                      |
| `Cta`                   | `label`, `href`, `className` (mặc định `btn btn-ghost-dark btn-sm`), `style`, `children`     | nút đơn; `btn-gold`, `btn-ghost` cho nền tối; `children` = chấm/icon đứng trước chữ                                                                  |
| `RichIntro`             | `html`, `className`                                                                          | đoạn rich-text đã sanitize                                                                                                                           |
| `InlineNote`            | `text`, `className`                                                                          | một dòng HTML nội dòng                                                                                                                               |
| `StatsList`             | `stats`, `band`                                                                              | dải số liệu (hero + stats)                                                                                                                           |
| `IconBadge` + `iconFor` | `children`, `className`                                                                      | huy hiệu tròn chứa icon                                                                                                                              |

Thiếu khối gì mà **≥ 2 section** cần → thêm vào `_shared` (tên tự nói việc nó làm, điều cần biết ghi ở khối đầu file), không copy qua lại.

## 6. Hiệu ứng reveal

`.reveal` / `.reveal-group` là class móc của `effects.css` + `SiteEffects.tsx`, nằm ở
layer `effects` nên **đè** class Tailwind về opacity / transform / transition.

- `Head` đã có `reveal`. `Note` đã có `reveal`.
- Danh sách nhiều mục: đặt `reveal reveal-group` (+ `data-stagger="70"`) lên
  **phần tử bao** (`ul`, `div.grid`). Mục con KHÔNG đặt `reveal` và không đặt
  opacity / transform / transition (`lint:layers` sẽ báo).
- Một khối đơn (ảnh, cột, panel): `reveal` lên chính nó.
- Không đặt `data-stagger` lên phần tử không phải `reveal-group`.

## 7. Style

- 100% class Tailwind trong JSX. Không CSS riêng, không `site.css`.
- Class dùng chung nhiều nơi đã đặt tên trong `_components/ui.tsx` (`SECTION*`, `PHOTO_FRAME`,
  `SECTION_PHOTO`, `ARCH`, `NAVY_PATTERN`, `NAVY_GRAIN`). Dùng chúng, không chép chuỗi.
- Hằng class **cục bộ** (`const CARD = "…"`) chỉ khi chuỗi đó dùng ≥ 2 lần **trong cùng file**,
  đặt đầu file, tên nói rõ nó là gì (không JSDoc).
- Không hardcode đường dẫn ảnh (`/images/...`) trong class hay JSX của section —
  ảnh trang trí cũng đi qua metadata (`image`, `backdropImage`) hoặc `ui.tsx` nếu là motif toàn site.
- Token: màu `navy-*`, `gold-*`, `light`, `ink-*`, `line`, `paper`, `cream`; chữ `text-h1…h5`, `text-2xs…3xl`;
  khoảng cách bậc 0.25rem. Giá trị tuỳ ý `[…]` chỉ cho gradient, radius hữu cơ, hình học icon.
- Wrapper bề ngang là `site-container` (không dùng `container`).

## 8. File client

- Bắt đầu bằng `"use client"`, tên `<Tên>.client.tsx`, nằm trong thư mục section.
- **Chỉ nhận dữ liệu thuần** (`items: Item[]`, `slides`, `label`) — không nhận `section`,
  không đọc metadata, không gọi API, không import `_shared/data`. Section (server) đọc CMS rồi đưa vào.
- Export: một component chính (trùng tên file, bỏ `.client`) + `type` của props. Không export hằng dữ liệu.
- id phần tử: `useId()`; liên kết `aria-controls` cũng từ `useId()`. Đặt section 2 lần trên
  trang không được trùng id.
- Chữ giao diện cố định (nút mũi tên, "Slide 1 of 3") là prop có mặc định, lý do ghi ở mục "Lưu ý" của khối đầu file.
- Có `useEffect` chạy timer/listener → dọn dẹp trong cleanup; tôn trọng `prefers-reduced-motion`.

## 9. Thêm section mới

```
npm run section:new -- <key>            # có --client nếu cần phần tương tác
```

Script copy `_template`, đổi tên, ghi vào registry rồi in các bước còn lại. Toàn bộ checklist:

1. `sections/<key>/<Pascal>.tsx` theo bộ xương mục 3 (+ `.client.tsx` nếu cần).
2. `sections/index.ts`: import + dòng `"<key>": Pascal` trong `SECTION_COMPONENTS` + export cuối file (script đã làm).
3. Backend `section-definition.seed.ts`: một entry `{ pageSlug: 'shared', sectionKey: '<key>', label, description, sortOrder, fields }`
   dùng helper `layout()`, `itemList()`, `stringList()`, `image()`, `textMap()`; field theo layout thì thêm `layouts: [...]`.
   Chạy `cd backend && npm run seed` — form admin và validate metadata đọc từ đây.
4. Admin `page-sections/_components/ComponentPicker.tsx`: hình phác thảo (`SKETCHES` + `SKETCH_BY_KEY`).
5. Nội dung mẫu: thêm section vào `page.seed.ts` (tắt `isActive` nếu chưa dùng), rồi
   `cd backend && npm run content:export` để sinh lại `src/content/cms-fallback.json` (không sửa tay).
6. `npm run check` sạch. `lint:sections --strict` phải sạch với section mới.

Quy ước khi làm **kiểu mới cho một section đang có**: giữ component cũ, tạo component
mới (tên theo bố cục), seed clone section cũ sang section mới đặt ngay sau, tắt section cũ
(`is_active = 0`) chứ không xoá — khách hàng có thể muốn dùng lại.

## 10. Thêm bố cục mới

1. Thêm tên vào `LAYOUTS` của component; viết `function <Tên>Body` cho layout đó trong cùng file
   (hoặc file `<Tên>.tsx` cùng thư mục nếu dài).
2. Seed backend: thêm `{ value, label, hint }` vào `layout([...])` của definition; field riêng
   của layout đó gắn `layouts: ['<tên>']`.
3. Dữ liệu giữ nguyên key; layout mới chỉ đổi cách hiển thị.

## 11. Kiểm tra

| Lệnh                                                     | Bắt gì                                                                                                                                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`                                      | kiểu                                                                                                                                                                                      |
| `npm run lint`                                           | ESLint (Next + TS)                                                                                                                                                                        |
| `npm run lint:layers`                                    | class Tailwind bị `effects.css` nuốt                                                                                                                                                      |
| `npm run lint:sections`                                  | cấu trúc S1–S7 (mục 2, 3, 8) và bộ xương R1–R3 (mục 3) đều là lỗi; file ghi dòng `lint-sections-ignore R2: <lý do>` trong khối đầu file thì được miễn và lý do in ra; `--no-strict` hạ bộ xương xuống cảnh báo |
| `npm run check`                                          | cả bốn — chạy trước khi commit                                                                                                                                                            |
| `npm run snapshot -- <thư-mục>`                          | chụp HTML 4 trang public (site đang chạy, không cần backend → dữ liệu fallback; id do React sinh đã chuẩn hoá). Refactor không đổi giao diện: chụp trước, chụp sau, `diff -r` hai thư mục |
| `npm run shot -- <thư-mục>`                              | chụp ảnh 4 trang × 2 bề ngang (1440, 390) bằng Chrome headless có sẵn, reduced-motion bật                                                                                                 |
| `npm run diff:png -- <A> <B> --noise <A2> [--out <dir>]` | so pixel hai bộ ảnh; `--noise` = bộ ảnh chụp lại cùng mã với A để tự bỏ qua dải nhiễu (marquee chạy chữ, vòng xoay); `--out` ghi ảnh tô đỏ chỗ khác                                       |

Quy trình refactor không đổi giao diện: `snapshot` + `shot` hai lần trước khi sửa (lần hai làm
`--noise`), sửa, `snapshot` + `shot` sau, rồi `diff -r` HTML và `diff:png`. Khác biệt HTML chấp
nhận được chỉ là thứ tự class / attribute; pixel phải giống.

## 12. Trạng thái chuyển đổi

**Đợt 1 (22/09/2026)** — thư mục, đặt tên, `_shared`, bản mẫu, script kiểm tra. HTML không đổi.

**Đợt 2 (22/09/2026)** — 19/20 section về bộ xương mục 3 (Shell → Head → thân → Note),
`lint:sections` nghiêm ngặt mặc định. HTML 4 trang chỉ khác thứ tự class / attribute;
ảnh 8 trang giống từng pixel ngoài dải nhiễu.

**Đợt 3 (22/09/2026)** — (a) faq, contact (form), icon-card-list (split) dùng Head: eyebrow
theo quy tắc ẩn toàn site (bật lại từng section bằng ô "Hiện eyebrow" trong admin), h2
của contact lên cỡ chuẩn, tiêu đề tô màu qua `headingAccent`. (b) Mọi chữ / ảnh từng viết
cứng đã thành trường CMS: `toggleLabel`, `itemLabel`, `alt` từng thẻ (media-cards);
`note`, `legend*`, `marketLabel*`, `imageAlt` (about-map); `unitLabel` (size-scale);
`labelLocation…labelHours` (contact); `backdropImage` (quote-form, steps circles);
`slides` của steps không còn bộ ảnh mặc định. Giá trị cũ nằm trong page.seed.ts và
migration `1789520000000-default_copy_to_cms` điền cho section chỉ có trong DB, nên
website hiển thị y như cũ. (c) `src/components/ui/` giữ lại để dùng chung sau này
(quyết định của chủ dự án).

Ngoại lệ còn lại (ghi lý do ngay trong file, là đặc thù chứ không phải nợ):

| Section | Quy tắc | Lý do                                                                                                |
| ------- | ------- | ---------------------------------------------------------------------------------------------------- |
| hero    | R1, R2  | khối đầu trang đặc thù: không đệm chuẩn, slider do client dựng cả `<section>`, tiêu đề h1 cỡ display |
| marquee | R2      | heading chính là dòng eyebrow căn giữa, không có h2                                                  |
