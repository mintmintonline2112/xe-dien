/**
 * Danh mục component section (khuôn form cho admin: nhãn, mô tả, field, bố cục) — nguồn chân lý do code quản lý.
 * Dùng bởi: database/seeding/seeding.service.ts; sectionKey = key registry frontend-next/src/app/(site)/_components/sections/index.ts = tên file component.
 * Lưu ý: một component = một BỐ CỤC đặt theo hình dạng (hero, faq…), biến thể = field `layout`, dùng được mọi trang (pageSlug `shared`).
 * Seed ghi đè label / mô tả / spec mỗi lần chạy và XOÁ HẲN component không còn trong code (bảng chỉ là khuôn form, không bảng nào
 * tham chiếu; section dùng component đã xoá sẽ hiện bằng GenericBlock ở frontend). Dữ liệu section của admin không bị đụng tới.
 * Khối lấy dữ liệu động (product-grid, category-grid, post-list) chỉ lưu cách lấy (nguồn, slug danh mục, số lượng), không lưu sản phẩm.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, In, Repository } from 'typeorm';
import {
  SectionDefinition,
  SectionFieldSpec,
} from 'src/modules/admin/pages/entities/section-definition.entity';

type DefinitionSeed = {
  pageSlug: string;
  sectionKey: string;
  label: string;
  description: string;
  fields: SectionFieldSpec[];
  sortOrder: number;
};

const IMAGE_HINT =
  'Ảnh: bấm "Thư viện" để chọn ảnh đã upload, hoặc dán /images/... (ảnh có sẵn của thiết kế).';
const ICON_HINT =
  'Icon (tuỳ chọn) — tên trong bộ icon chung: bolt, truck, shield, refresh, wallet, card, percent, gift, briefcase, store, headset, users, star, check, leaf, wrench, battery, charger, bike, moped, kick-scooter, tricycle, car, golf, bus, kid, forklift, tire, parts, pin, phone, mail, clock, calendar, building, box, chat. Trống thì xoay vòng theo thứ tự.';
const CTA_HINT = 'Chữ trên nút để trống thì ẩn nút. Link: #tên-section trên cùng trang (VD #tu-van) hoặc /duong-dan.';

const buildLayoutField = (
  options: Array<{ value: string; label: string; hint?: string }>,
): SectionFieldSpec => ({
  key: 'layout',
  label: 'Bố cục',
  type: 'select',
  options,
  hint: 'Đổi bố cục thì dữ liệu bên dưới giữ nguyên — chỉ cách hiển thị thay đổi.',
});

const buildStringListField = (key: string, label: string, hint?: string, layouts?: string[]): SectionFieldSpec => ({
  key, label, type: 'stringList', ...(hint ? { hint } : {}), ...(layouts ? { layouts } : {}),
});

const buildImageField = (key: string, label: string, hint?: string, layouts?: string[], positionKey?: string): SectionFieldSpec => ({
  key, label, type: 'image', hint: hint ?? IMAGE_HINT, ...(layouts ? { layouts } : {}), ...(positionKey ? { positionKey } : {}),
});

const buildTextMapField = (
  label: string,
  fields: Array<{ name: string; label: string }>,
  hint?: string,
  layouts?: string[],
): SectionFieldSpec => ({
  key: '__self__', label, type: 'textMap', fields, ...(hint ? { hint } : {}), ...(layouts ? { layouts } : {}),
});

type ItemField = { name: string; label: string; kind: 'text' | 'textarea' | 'image' };
const buildItemListField = (
  key: string,
  label: string,
  itemFields: ItemField[],
  hint?: string,
  layouts?: string[],
): SectionFieldSpec => ({
  key, label, type: 'itemList', itemFields, ...(hint ? { hint } : {}), ...(layouts ? { layouts } : {}),
});

const CTA_FIELDS = [
  { name: 'ctaLabel', label: 'Chữ trên nút' },
  { name: 'ctaHref', label: 'Link của nút' },
];

const DEFINITIONS: DefinitionSeed[] = [
  {
    pageSlug: 'shared', sectionKey: 'hero', sortOrder: 1,
    label: 'Hero / banner đầu trang',
    description: 'Hero.tsx — khối đầu trang. "Banner bo góc": băng chuyền ảnh trong khung nội dung, chữ + nút phủ bên trái, mũi tên + chấm (kiểu banner cửa hàng). "Slider toàn màn hình": ảnh nền tràn màn hình chuyển slide. "Tĩnh": tiêu đề lớn + giới thiệu + ảnh tràn mép phải.',
    fields: [
      buildLayoutField([
        { value: 'banner', label: 'Banner bo góc', hint: 'Mỗi slide có nút riêng' },
        { value: 'slider', label: 'Slider toàn màn hình', hint: 'Ảnh nền chuyển slide, dãy số bên phải' },
        { value: 'static', label: 'Tĩnh', hint: 'Một ảnh tràn mép phải' },
      ]),
      buildItemListField('slides', 'Slide', [
        { name: 'image', label: 'Ảnh nền (nên 1920×820)', kind: 'image' },
        { name: 'title', label: 'Tiêu đề', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
        { name: 'label', label: 'Chữ trên nút (bố cục Banner)', kind: 'text' },
        { name: 'href', label: 'Link của nút (bố cục Banner)', kind: 'text' },
        { name: 'alt', label: 'Mô tả ảnh (alt)', kind: 'text' },
      ], IMAGE_HINT + ' Tiêu đề / mô tả để trống thì dùng Heading / Nội dung của section. Nút của slide trống thì dùng Nút 1 bên dưới.', ['banner', 'slider']),
      buildImageField('image', 'Ảnh tràn mép phải', undefined, ['static']),
      buildItemListField('stats', 'Số liệu nổi bật', [
        { name: 'label', label: 'Nhãn', kind: 'text' },
        { name: 'value', label: 'Giá trị', kind: 'text' },
      ], 'Giá trị có số ở đầu sẽ tự chạy hiệu ứng đếm (VD: 13+, 50.000+).', ['slider', 'static']),
      buildTextMapField('Nút', [
        { name: 'ctaLabel', label: 'Nút 1 — chữ' },
        { name: 'ctaHref', label: 'Nút 1 — link' },
        { name: 'cta2Label', label: 'Nút 2 — chữ (Slider / Tĩnh)' },
        { name: 'cta2Href', label: 'Nút 2 — link' },
      ], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'promo-tiles', sortOrder: 2,
    label: 'Ô nổi bật màu (khuyến mãi / trả góp…)',
    description: 'PromoTiles.tsx — hàng 3 ô màu (đỏ / xanh / vàng xoay vòng), mỗi ô icon + tiêu đề in hoa + một dòng mô tả, bấm cả ô. Đệm mỏng, đặt ngay dưới banner.',
    fields: [
      buildItemListField('items', 'Ô', [
        { name: 'title', label: 'Tiêu đề (VD: KHUYẾN MÃI!)', kind: 'text' },
        { name: 'text', label: 'Mô tả ngắn', kind: 'text' },
        { name: 'icon', label: 'Icon', kind: 'text' },
        { name: 'href', label: 'Link khi bấm ô', kind: 'text' },
      ], ICON_HINT + ' Nên 3 ô để vừa một hàng.'),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'product-grid', sortOrder: 3,
    label: 'Khối sản phẩm (tự lấy từ danh mục)',
    description: 'ProductGrid.tsx — sản phẩm lấy tự động từ Admin → Sản phẩm. "Lưới": 5 cột. "Dải trượt": cuộn ngang. "Chia đôi": cột trái ảnh danh mục + chip danh mục con + nút, phải lưới 4 cột. Tiêu đề bên trái, link "Xem tất cả" bên phải.',
    fields: [
      buildLayoutField([
        { value: 'grid', label: 'Lưới 5 cột' },
        { value: 'rail', label: 'Dải trượt ngang' },
        { value: 'split', label: 'Chia đôi có ảnh danh mục', hint: 'Cần nhập slug danh mục' },
      ]),
      {
        key: 'source', label: 'Lấy sản phẩm nào', type: 'select',
        options: [
          { value: 'featured', label: 'Sản phẩm mua nhiều (đã tick "mua nhiều")' },
          { value: 'newest', label: 'Mới nhất' },
          { value: 'category', label: 'Theo danh mục bên dưới' },
        ],
        hint: '"Mới nhất" cũng lọc theo danh mục nếu có nhập slug.',
      },
      buildTextMapField('Cách lấy + nút', [
        { name: 'categorySlug', label: 'Slug danh mục (VD: xe-may-dien) — xem ở Admin → Danh mục sản phẩm' },
        { name: 'limit', label: 'Số sản phẩm tối đa (mặc định 10, tối đa 24)' },
        { name: 'ctaLabel', label: 'Chữ link "xem tất cả" (trống thì ẩn)' },
        { name: 'ctaHref', label: 'Link (trống thì về trang danh mục / tất cả sản phẩm)' },
      ], CTA_HINT),
      buildImageField('image', 'Ảnh cột trái (trống thì dùng ảnh danh mục)', undefined, ['split']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'category-grid', sortOrder: 4,
    label: 'Ô danh mục sản phẩm',
    description: 'CategoryGrid.tsx — các danh mục lấy tự động từ Admin → Danh mục sản phẩm (icon, ảnh, thứ tự, số sản phẩm). "Ô icon": vòng tròn icon + tên. "Thẻ ảnh": ảnh danh mục có tên phủ dưới.',
    fields: [
      buildLayoutField([
        { value: 'tiles', label: 'Ô icon' },
        { value: 'cards', label: 'Thẻ ảnh' },
      ]),
      buildTextMapField('Cách lấy + nút', [
        { name: 'parentSlug', label: 'Slug danh mục cha (trống = danh mục gốc; có = các danh mục con của nó)' },
        { name: 'limit', label: 'Số danh mục tối đa (mặc định 12)' },
        { name: 'ctaLabel', label: 'Chữ link bên phải tiêu đề (trống thì ẩn)' },
        { name: 'ctaHref', label: 'Link' },
      ], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'post-list', sortOrder: 5,
    label: 'Bài viết mới (tin tức)',
    description: 'PostList.tsx — bài viết lấy tự động từ Admin → Bài viết. "Lưới": 4 thẻ. "Danh sách": 1 bài lớn bên trái + danh sách bên phải.',
    fields: [
      buildLayoutField([
        { value: 'grid', label: 'Lưới 4 thẻ' },
        { value: 'list', label: '1 bài lớn + danh sách' },
      ]),
      buildTextMapField('Cách lấy + nút', [
        { name: 'categorySlug', label: 'Slug danh mục tin (trống = mọi danh mục)' },
        { name: 'limit', label: 'Số bài (mặc định 4; bố cục danh sách 5)' },
        { name: 'ctaLabel', label: 'Chữ link "xem tất cả" (trống thì ẩn)' },
        { name: 'ctaHref', label: 'Link (trống thì về trang tin tức)' },
      ], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'store-list', sortOrder: 6,
    label: 'Hệ thống showroom / cửa hàng',
    description: 'StoreList.tsx — danh sách cửa hàng. "Lưới thẻ": thẻ có ảnh, địa chỉ, điện thoại, giờ mở cửa, link bản đồ. "Danh sách theo khu vực": gom theo ô Khu vực.',
    fields: [
      buildLayoutField([
        { value: 'grid', label: 'Lưới thẻ' },
        { value: 'list', label: 'Danh sách theo khu vực' },
      ]),
      buildItemListField('items', 'Cửa hàng', [
        { name: 'title', label: 'Tên cửa hàng', kind: 'text' },
        { name: 'caption', label: 'Khu vực (VD: TP. Hồ Chí Minh)', kind: 'text' },
        { name: 'text', label: 'Địa chỉ', kind: 'textarea' },
        { name: 'label', label: 'Điện thoại', kind: 'text' },
        { name: 'value', label: 'Giờ mở cửa', kind: 'text' },
        { name: 'href', label: 'Link Google Maps', kind: 'text' },
        { name: 'image', label: 'Ảnh cửa hàng', kind: 'image' },
      ], IMAGE_HINT),
      buildTextMapField('Chữ phụ + nút', [
        { name: 'mapLabel', label: 'Chữ link bản đồ (VD: Xem bản đồ; trống thì ẩn link)' },
        { name: 'note', label: 'Ghi chú cuối khối' },
        ...CTA_FIELDS,
      ], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'service-strip', sortOrder: 7,
    label: 'Dải cam kết dịch vụ',
    description: 'ServiceStrip.tsx — dải nền trắng có viền, mỗi cam kết một icon vàng + tiêu đề in hoa + một dòng mô tả (VD miễn phí vận chuyển, đổi trả 7 ngày…).',
    fields: [
      buildItemListField('items', 'Cam kết', [
        { name: 'title', label: 'Tiêu đề', kind: 'text' },
        { name: 'text', label: 'Mô tả ngắn', kind: 'text' },
        { name: 'icon', label: 'Icon', kind: 'text' },
      ], ICON_HINT + ' Nên 4 mục.'),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'rich-text', sortOrder: 8,
    label: 'Bài viết tự do (chính sách, hướng dẫn)',
    description: 'RichText.tsx — tiêu đề + nội dung soạn bằng trình soạn thảo (Nội dung của section) trong khung giấy trắng vừa đọc. Bố cục "Một cột" hoặc "Có hộp bên phải" (ghi chú nổi bật + nút, đứng yên khi cuộn).',
    fields: [
      buildLayoutField([
        { value: 'article', label: 'Một cột' },
        { value: 'aside', label: 'Có hộp bên phải' },
      ]),
      buildImageField('image', 'Ảnh đầu bài (tuỳ chọn)'),
      buildTextMapField('Hộp bên phải', [
        { name: 'asideTitle', label: 'Tiêu đề hộp (VD: Hotline bảo hành)' },
        { name: 'asideText', label: 'Nội dung hộp (xuống dòng 2 lần để tách đoạn)' },
        ...CTA_FIELDS,
      ], CTA_HINT, ['aside']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'media-cards', sortOrder: 9,
    label: 'Lưới thẻ có ảnh',
    description: 'MediaCards.tsx — lưới thẻ có ảnh (dòng xe, dịch vụ, đối tác…). Bố cục: ảnh tròn đánh số · thẻ lớn có công tắc rút gọn · thẻ tên (không ảnh) · ảnh lớn + lưới thẻ ảnh · thẻ ảnh có nhãn số + icon.',
    fields: [
      buildLayoutField([
        { value: 'circles', label: 'Ảnh tròn đánh số' },
        { value: 'toggle', label: 'Thẻ lớn + công tắc', hint: 'Nền màu chủ đạo khi thẻ không có ảnh' },
        { value: 'names', label: 'Thẻ tên' },
        { value: 'photo', label: 'Ảnh lớn + lưới thẻ ảnh' },
        { value: 'badge', label: 'Thẻ ảnh có nhãn số' },
      ]),
      buildItemListField('items', 'Thẻ', [
        { name: 'title', label: 'Tên', kind: 'text' },
        { name: 'short', label: 'Mô tả ngắn (bố cục Thẻ lớn)', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'imagePosition', label: 'Vị trí ảnh (VD: center 60%)', kind: 'text' },
        { name: 'alt', label: 'Mô tả ảnh (alt; trống thì dùng Tên)', kind: 'text' },
        { name: 'icon', label: 'Icon (bố cục Nhãn số)', kind: 'text' },
      ], IMAGE_HINT + ' ' + ICON_HINT),
      buildStringListField('sizes', 'Chip phụ (hiện trong bản đầy đủ của thẻ)', undefined, ['toggle']),
      buildTextMapField('Chữ trên thẻ lớn', [
        { name: 'toggleLabel', label: 'Chữ cạnh công tắc (VD: Bản rút gọn; trống thì chỉ có công tắc)' },
        ...CTA_FIELDS,
        { name: 'note', label: 'Dòng chú thích cuối khối' },
      ], CTA_HINT, ['toggle']),
      buildImageField('image', 'Ảnh lớn phía trên lưới', undefined, ['photo']),
      buildItemListField('photos', 'Dải ảnh dưới lưới', [
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'caption', label: 'Chú thích', kind: 'text' },
      ], IMAGE_HINT, ['badge']),
      buildTextMapField('Chữ phụ', [
        { name: 'itemLabel', label: 'Chữ trước số thứ tự (VD: Dòng xe; trống thì chỉ có số)' },
        { name: 'imageAlt', label: 'Mô tả ảnh lớn (alt)' },
        { name: 'note', label: 'Dòng ghi chú cuối khối (có thể dùng <strong>)' },
      ], undefined, ['photo', 'badge']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'media-tabs', sortOrder: 10,
    label: 'Tab nội dung có ảnh',
    description: 'MediaTabs.tsx — hàng tab gạch chân (VD mỗi tab một dòng xe); bấm tab hiện ảnh bên trái, bên phải là tiêu đề lớn viết hoa, đoạn dẫn in đậm, mô tả và nút có mũi tên. Có Heading thì hiện đầu khối.',
    fields: [
      buildItemListField('items', 'Tab', [
        { name: 'title', label: 'Tên tab', kind: 'text' },
        { name: 'heading', label: 'Tiêu đề lớn (trống thì dùng tên tab)', kind: 'text' },
        { name: 'short', label: 'Đoạn dẫn in đậm', kind: 'textarea' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'imagePosition', label: 'Vị trí ảnh (VD: center 60%)', kind: 'text' },
        { name: 'ctaLabel', label: 'Chữ trên nút (trống thì dùng nút chung bên dưới)', kind: 'text' },
        { name: 'ctaHref', label: 'Link của nút', kind: 'text' },
      ], IMAGE_HINT + ' Mô tả: xuống dòng 2 lần để tách đoạn. Nên 3–6 tab để hàng tab vừa một dòng trên máy tính.'),
      buildTextMapField('Chữ phụ + nút chung', [
        { name: 'itemLabel', label: 'Chữ nhỏ trên tiêu đề kèm số thứ tự (VD: Dòng xe → DÒNG XE 01; trống thì ẩn)' },
        { name: 'ctaLabel', label: 'Chữ trên nút chung (VD: Xem chi tiết)' },
        { name: 'ctaHref', label: 'Link của nút chung' },
      ], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'photo-strip', sortOrder: 11,
    label: 'Dải ảnh + ghi chú',
    description: 'PhotoStrip.tsx — dải ảnh khung bo góc có chú thích, dưới là dòng ghi chú + nút. Có Heading thì hiện đầu khối, không thì chỉ có dải ảnh.',
    fields: [
      buildItemListField('items', 'Ảnh', [
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'caption', label: 'Chú thích', kind: 'text' },
      ], IMAGE_HINT),
      buildTextMapField('Ghi chú + nút', [{ name: 'note', label: 'Dòng ghi chú' }, ...CTA_FIELDS], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'photo-slider', sortOrder: 12,
    label: 'Dải ảnh trượt (slider) + ghi chú',
    description: 'PhotoSlider.tsx — như "Dải ảnh + ghi chú" nhưng dải ảnh là slider: máy tính hiện 3 ảnh, tablet 2, điện thoại 1; trượt vòng từng ảnh bằng mũi tên, chấm hoặc vuốt (không tự chạy). Dưới là dòng ghi chú + nút. Có Heading thì hiện đầu khối.',
    fields: [
      buildItemListField('items', 'Ảnh', [
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'caption', label: 'Chú thích', kind: 'text' },
      ], IMAGE_HINT + ' Từ 3 ảnh trở lên thì trượt được trên mọi màn hình (ảnh cuối nối lại ảnh đầu); 2 ảnh thì máy tính đứng yên, tablet và điện thoại vẫn trượt.'),
      buildTextMapField('Ghi chú + nút', [{ name: 'note', label: 'Dòng ghi chú' }, ...CTA_FIELDS], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'icon-card-list', sortOrder: 13,
    label: 'Danh sách dòng có icon',
    description: 'IconCardList.tsx — mỗi dòng một mục có icon (tiêu đề + mô tả). Bố cục "Danh sách": đầu khối + danh sách. Bố cục "Chia đôi": chữ + nút + ảnh lớn bên trái, ảnh blob có nhãn + danh sách bên phải.',
    fields: [
      buildLayoutField([
        { value: 'list', label: 'Danh sách' },
        { value: 'split', label: 'Chia đôi có ảnh' },
      ]),
      buildItemListField('items', 'Dòng', [
        { name: 'title', label: 'Tiêu đề', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
        { name: 'icon', label: 'Icon', kind: 'text' },
      ], ICON_HINT),
      buildImageField('image', 'Ảnh lớn bên trái', undefined, ['split']),
      buildImageField('image2', 'Ảnh blob bên phải', undefined, ['split']),
      buildTextMapField('Chữ và nút (bố cục Chia đôi)', [
        ...CTA_FIELDS,
        { name: 'imageAlt', label: 'Mô tả ảnh lớn (alt)' },
        { name: 'image2Alt', label: 'Mô tả ảnh blob (alt)' },
        { name: 'badge', label: 'Nhãn trên ảnh blob (dùng | để xuống dòng, VD 10 năm|Kinh nghiệm)' },
      ], CTA_HINT, ['split']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'spec-sheet', sortOrder: 14,
    label: 'Bảng thông số',
    description: 'SpecSheet.tsx — phiếu thông số sản phẩm: đầu khối căn giữa, bảng 2 cột (tên thông số có icon │ giá trị) trong thẻ trắng, bên cạnh là ảnh dọc có nhãn tròn; dưới bảng là ghi chú + nút. Nội dung: đoạn ĐẦU hiện dưới tiêu đề, các đoạn SAU hiện dưới bảng cạnh nút.',
    fields: [
      buildItemListField('items', 'Dòng thông số', [
        { name: 'title', label: 'Tên thông số (VD: Quãng đường)', kind: 'text' },
        { name: 'text', label: 'Giá trị (VD: 80 km / lần sạc)', kind: 'text' },
        { name: 'icon', label: 'Icon', kind: 'text' },
      ], ICON_HINT),
      buildImageField('image', 'Ảnh dọc cạnh bảng', undefined, undefined, 'imagePosition'),
      buildTextMapField('Ảnh + nút', [
        { name: 'imageAlt', label: 'Mô tả ảnh (alt)' },
        { name: 'badge', label: 'Nhãn tròn trên ảnh (dùng | để xuống dòng, VD 0%|Trả góp)' },
        ...CTA_FIELDS,
      ], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'steps', sortOrder: 15,
    label: 'Các bước quy trình',
    description: 'Steps.tsx — quy trình theo bước. Bố cục "Slider + ô bước": nền màu chủ đạo, slider ảnh tự chạy, bấm ô bước N chuyển tới ảnh N, có nút. Bố cục "Vòng tròn": bước đánh số trong vòng tròn nối bằng đường cong nét đứt.',
    fields: [
      buildLayoutField([
        { value: 'slider', label: 'Slider + ô bước' },
        { value: 'circles', label: 'Vòng tròn nối nhau', hint: 'Nên 3–5 bước để nằm trên một hàng' },
      ]),
      buildItemListField('items', 'Các bước', [
        { name: 'title', label: 'Tên bước', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
      ]),
      buildItemListField('slides', 'Ảnh slider', [
        { name: 'image', label: 'Ảnh', kind: 'image' },
        { name: 'caption', label: 'Chú thích', kind: 'text' },
        { name: 'alt', label: 'Mô tả ảnh (alt)', kind: 'text' },
      ], IMAGE_HINT + ' Nên để số ảnh bằng số bước (bấm bước N → ảnh N).', ['slider']),
      buildTextMapField('Nút', CTA_FIELDS, CTA_HINT, ['slider']),
      buildImageField('backdropImage', 'Ảnh mờ lót nền', 'Ảnh phủ mờ 7% giữa nền sáng. ' + IMAGE_HINT, ['circles']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'feature-list', sortOrder: 16,
    label: 'Danh sách mục + chip',
    description: 'FeatureList.tsx — mục có ghi chú nhỏ + dải chip. Bố cục "Kẹp ảnh tròn": mục đánh số hai bên ảnh tròn trung tâm, dưới là câu mục tiêu + chip. Bố cục "Lưới tick": lưới mục có dấu tick + chip.',
    fields: [
      buildLayoutField([
        { value: 'split', label: 'Kẹp ảnh tròn' },
        { value: 'grid', label: 'Lưới tick' },
      ]),
      buildItemListField('items', 'Mục', [
        { name: 'label', label: 'Tên mục', kind: 'text' },
        { name: 'note', label: 'Ghi chú (chữ nghiêng nhỏ)', kind: 'text' },
      ]),
      buildStringListField('chips', 'Chip (VD thương hiệu)', 'Để trống thì ẩn dải chip.'),
      buildImageField('image', 'Ảnh tròn trung tâm', undefined, ['split']),
      buildTextMapField('Dải chip', [{ name: 'note', label: 'Câu hiện trong dải chip' }]),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'marquee', sortOrder: 17,
    label: 'Chữ chạy ngang',
    description: 'Marquee.tsx — tiêu đề nhỏ (Heading) + chữ chạy ngang; đủ mục thì chia 2 dòng chạy ngược chiều; câu ghi chú lấy từ Nội dung.',
    fields: [buildStringListField('items', 'Các mục chạy', 'Heading = tiêu đề nhỏ phía trên; Nội dung = câu ghi chú phía dưới.')],
  },
  {
    pageSlug: 'shared', sectionKey: 'feature-cards', sortOrder: 18,
    label: 'Lưới thẻ icon',
    description: 'FeatureCards.tsx — lưới thẻ màu chủ đạo có icon + tiêu đề + mô tả (VD lý do chọn chúng tôi).',
    fields: [
      buildItemListField('items', 'Thẻ', [
        { name: 'title', label: 'Tiêu đề', kind: 'text' },
        { name: 'text', label: 'Mô tả', kind: 'textarea' },
        { name: 'icon', label: 'Icon', kind: 'text' },
      ], ICON_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'faq', sortOrder: 19,
    label: 'FAQ (accordion)',
    description: 'Faq.tsx — câu hỏi bấm mở. Bố cục "2 cột": thẻ trắng viền trái có dấu +, tự chia 2 cột hoặc theo nhóm. Bố cục "Chia đôi có ảnh": accordion 1 cột bên trái, ảnh lớn bo góc bên phải, ghi chú cuối cột.',
    fields: [
      buildLayoutField([
        { value: 'columns', label: '2 cột' },
        { value: 'split', label: 'Chia đôi có ảnh' },
      ]),
      buildItemListField('items', 'Câu hỏi', [
        { name: 'question', label: 'Câu hỏi', kind: 'text' },
        { name: 'answer', label: 'Câu trả lời', kind: 'textarea' },
        { name: 'group', label: 'Nhóm (tuỳ chọn, bố cục 2 cột)', kind: 'text' },
      ], 'Câu trả lời: xuống dòng 2 lần để tách đoạn. Nhóm: các câu cùng tên nhóm gom thành 1 cột có tiêu đề.'),
      buildTextMapField('Tiêu đề (bố cục 2 cột)', [
        { name: 'headingAccent', label: 'Phần tiêu đề tô màu (phải nằm trong Heading)' },
      ], undefined, ['columns']),
      buildImageField('image', 'Ảnh lớn ở cột phải', undefined, ['split']),
      buildTextMapField('Ghi chú + tuỳ chọn hiển thị (bố cục Chia đôi)', [
        { name: 'note', label: 'Ghi chú cuối cột trái (disclaimer)' },
        { name: 'imageAlt', label: 'Mô tả ảnh (alt)' },
        { name: 'imageSide', label: "Vị trí ảnh — nhập 'left' để đảo ảnh sang trái" },
      ], undefined, ['split']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'quote-form', sortOrder: 20,
    label: 'Form đăng ký tư vấn + lợi ích',
    description: 'QuoteForm.tsx — nền màu chủ đạo: tiêu đề + danh sách lợi ích + nút gọi hotline bên trái, form đăng ký tư vấn (gửi API thật → Admin → Liên hệ → Yêu cầu tư vấn) bên phải.',
    fields: [
      buildStringListField('items', 'Lợi ích (dấu tick)'),
      {
        key: 'defaultType', label: 'Loại yêu cầu chọn sẵn', type: 'select',
        options: [
          { value: 'consult', label: 'Tư vấn chọn xe' },
          { value: 'quote', label: 'Nhận báo giá' },
          { value: 'installment', label: 'Mua trả góp 0%' },
          { value: 'test_ride', label: 'Xem xe / lái thử' },
          { value: 'dealer', label: 'Đăng ký đại lý' },
        ],
      },
      buildTextMapField('Chữ trên form', [
        { name: 'formTitle', label: 'Tiêu đề form (trống = "Đăng ký tư vấn miễn phí")' },
        { name: 'formSubtitle', label: 'Dòng dưới tiêu đề form' },
        { name: 'submitLabel', label: 'Chữ nút gửi' },
        { name: 'note', label: 'Dòng ghi chú dưới danh sách lợi ích' },
      ]),
      buildImageField('backdropImage', 'Ảnh mờ lót nền (tuỳ chọn)', 'Ảnh phủ mờ 16% lên nền màu chủ đạo. ' + IMAGE_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'checklist', sortOrder: 21,
    label: 'Lưới checklist',
    description: 'Checklist.tsx — lưới mục có dấu tick, dưới là dòng ghi chú (có thể chứa link) + nút.',
    fields: [
      buildStringListField('items', 'Các mục'),
      buildTextMapField('Ghi chú + nút', [
        { name: 'note', label: 'Dòng ghi chú (được dùng <a href="...">link</a>)' },
        ...CTA_FIELDS,
      ], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'numbered-list', sortOrder: 22,
    label: 'Danh sách đánh số (chia đôi)',
    description: 'NumberedList.tsx — chia đôi: bên trái tiêu đề + giới thiệu + ghi chú + nút (đứng yên khi cuộn trên máy tính); bên phải các mục đánh số 01, 02… chia 2 cột, ngăn bằng đường kẻ mảnh. Cùng dữ liệu với "Lưới checklist".',
    fields: [
      buildStringListField('items', 'Các mục (tự đánh số 01, 02…)'),
      buildTextMapField('Ghi chú + nút', [
        { name: 'note', label: 'Dòng ghi chú (được dùng <a href="...">link</a>)' },
        ...CTA_FIELDS,
      ], CTA_HINT),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'contact', sortOrder: 23,
    label: 'Thông tin liên hệ',
    description: 'Contact.tsx — địa điểm / địa chỉ / email / điện thoại / giờ mở cửa. Bố cục "Có form": cột trái thông tin + ghi chú + ảnh, cột phải form liên hệ. Bố cục "Danh sách": chỉ danh sách thông tin.',
    fields: [
      buildLayoutField([
        { value: 'form', label: 'Có form liên hệ' },
        { value: 'list', label: 'Chỉ danh sách' },
      ]),
      buildTextMapField('Thông tin liên hệ', [
        { name: 'location', label: 'Địa điểm' },
        { name: 'address', label: 'Địa chỉ' },
        { name: 'email', label: 'Email' },
        { name: 'phone', label: 'Điện thoại' },
        { name: 'hours', label: 'Giờ mở cửa' },
      ], 'Để trống ô nào thì lấy từ Admin → Trang Liên hệ (rồi tới cấu hình mặc định).'),
      buildTextMapField('Nhãn từng dòng', [
        { name: 'labelLocation', label: 'Nhãn dòng địa điểm (VD: Khu vực)' },
        { name: 'labelAddress', label: 'Nhãn dòng địa chỉ (VD: Địa chỉ)' },
        { name: 'labelEmail', label: 'Nhãn dòng email (VD: Email)' },
        { name: 'labelPhone', label: 'Nhãn dòng điện thoại (VD: Hotline)' },
        { name: 'labelHours', label: 'Nhãn dòng giờ mở cửa (VD: Giờ mở cửa)' },
      ], 'Trống thì dòng chỉ có nội dung, không có nhãn.'),
      buildTextMapField('Ghi chú', [
        { name: 'note', label: 'Ghi chú dưới danh sách' },
        { name: 'imageAlt', label: 'Mô tả ảnh (alt)' },
      ]),
      buildImageField('image', 'Ảnh dưới ghi chú', undefined, ['form']),
    ],
  },
  {
    pageSlug: 'shared', sectionKey: 'stats', sortOrder: 24,
    label: 'Dải số liệu',
    description: 'Stats.tsx — đầu khối + lưới thẻ số liệu: icon, con số lớn tự chạy đếm khi cuộn tới, nhãn, ghi chú ngắn.',
    fields: [
      buildItemListField('stats', 'Số liệu nổi bật', [
        { name: 'value', label: 'Giá trị (VD: 1.200+)', kind: 'text' },
        { name: 'label', label: 'Nhãn', kind: 'text' },
        { name: 'note', label: 'Ghi chú ngắn (tuỳ chọn)', kind: 'text' },
        { name: 'icon', label: 'Icon', kind: 'text' },
      ], 'Giá trị có số ở đầu sẽ tự chạy hiệu ứng đếm (VD: 10+, 1.200+, 98%). ' + ICON_HINT),
    ],
  },
];

export const SECTION_COMPONENT_KEYS = DEFINITIONS.map(
  (definition) => definition.sectionKey,
);

@Injectable()
export class SectionDefinitionSeed {
  constructor(
    @InjectRepository(SectionDefinition)
    private readonly definitionRepo: Repository<SectionDefinition>,
  ) {}

  async run(): Promise<void> {
    let upsertedCount = 0;
    for (const definition of DEFINITIONS) {
      const existing = await this.definitionRepo.findOne({
        where: { sectionKey: definition.sectionKey },
        withDeleted: true,
      });
      if (existing) {
        existing.pageSlug = definition.pageSlug;
        existing.label = definition.label;
        existing.description = definition.description;
        existing.fields = definition.fields;
        existing.sortOrder = definition.sortOrder;
        existing.deletedAt = null;
        await this.definitionRepo.save(existing);
      } else {
        await this.definitionRepo.save(this.definitionRepo.create(definition));
      }
      upsertedCount++;
    }

    const staleDefinitions = await this.definitionRepo.find({
      where: { sectionKey: Not(In(SECTION_COMPONENT_KEYS)) },
      withDeleted: true,
    });
    if (staleDefinitions.length > 0)
      await this.definitionRepo.remove(staleDefinitions);

    console.log(
      `--- [Seed] Section definitions: synced ${upsertedCount} definition(s)` +
        (staleDefinitions.length > 0
          ? `, removed ${staleDefinitions.length} old one(s).`
          : '.'),
    );
  }
}
