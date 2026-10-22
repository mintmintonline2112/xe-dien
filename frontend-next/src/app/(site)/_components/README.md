# `app/(site)/_components` — bản đồ thư mục

Code giao diện của site public, không phải route. Chia theo **vai trò**, không theo trang:

```
_components/
├── layout/              Khung trang — chỉ (site)/layout.tsx dùng
│   ├── Header.tsx       Menu CMS + Brand + SocialIcons
│   ├── Footer.tsx
│   ├── Brand.tsx        Logo + tên thương hiệu (Header, Footer dùng chung)
│   ├── SocialIcons.tsx
│   ├── CopyGuard.tsx    Chặn copy (client)
│   └── SiteEffects.tsx  Hiệu ứng cuộn / reveal / đếm số (client, GSAP)
│
├── sections/            Section CMS — mỗi thư mục = MỘT component, tên = key registry
│   ├── README.md        ⟵ QUY ĐỊNH viết section: đọc trước khi thêm / sửa
│   ├── index.ts         Registry: key → component (+ bảng tên cũ)
│   ├── _shared/         Đồ dùng chung của mọi section (data / blocks / icons)
│   ├── _template/       Bản mẫu cho section mới (`npm run section:new <key>`)
│   ├── hero/            Hero.tsx + HeroSlides.client.tsx
│   ├── about-map/       AboutMap.tsx + WorldMap.client.tsx + RegionsPanel.client.tsx
│   ├── steps/           Steps.tsx + StepsChain.client.tsx + StepsSlider.client.tsx
│   └── …                (19 section + generic-block)
│
├── SectionRenderer.tsx  Trang → danh sách section → component theo registry
├── ui.tsx               Class Tailwind đặt tên (SECTION*, PHOTO_FRAME…) + Eyebrow, PageHero, CtaBand
└── forms.tsx            ContactForm, QuoteForm, NewsletterForm (client; section + trang news dùng)
```

Quy tắc đặt chỗ:

| Cần thêm | Đặt ở |
|---|---|
| Section CMS mới | `sections/<key>/` — theo `sections/README.md` |
| Phần tương tác của MỘT section | cùng thư mục section đó, tên `<Tên>.client.tsx` |
| Khối / helper mà ≥ 2 section dùng | `sections/_shared/` |
| Class hoặc mảnh giao diện cả site dùng (section lẫn trang dựng tay) | `ui.tsx` |
| Thứ chỉ khung trang dùng | `layout/` |
| Form gửi dữ liệu | `forms.tsx` |
| UI không dính nghiệp vụ, site + admin cùng dùng | `src/components/ui/` (Button, Badge, Card, Spinner, Modal — giữ sẵn để dùng chung, xem README trong đó) |

Đặt tên file: component `PascalCase.tsx`; file client thêm `.client.tsx`; thư mục `kebab-case`.
