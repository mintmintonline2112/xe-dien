/**
 * Nội dung mặc định của website Xe Điện Xanh (trang + section) — nguồn nội dung DUY NHẤT, component không có chữ mặc định.
 * Dùng bởi: database/seeding/seeding.service.ts; src/scripts/export-content.ts (`npm run content:export` sinh bản dự phòng cho frontend).
 * Lưu ý: sectionKey = id neo trên trang (menu / nút trỏ vào, giữ ổn định — form tư vấn luôn là `tu-van`); metadata._component = component
 * trong registry frontend, metadata.layout = bố cục. Chỉ thêm theo slug / sectionKey; section đã có chỉ được bổ sung key metadata còn
 * thiếu, không đè chỉnh sửa của admin — chạy lại db:seed an toàn. Số điện thoại / địa chỉ showroom là dữ liệu mẫu, thông tin liên hệ
 * chính lấy từ Admin → Trang Liên hệ. Khối sản phẩm / danh mục / tin chỉ lưu cách lấy dữ liệu (slug, số lượng).
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { PageSection } from 'src/modules/admin/pages/entities/page-section.entity';

export type PageDefinition = {
  page: DeepPartial<Page> & { slug: string };
  sections: Array<DeepPartial<PageSection> & { sectionKey: string }>;
};

const CONSULT_BENEFITS = [
  'Tư vấn đúng nhu cầu: đi học, đi làm, chở hàng hay kinh doanh dịch vụ',
  'Báo giá tốt nhất kèm quà tặng đang áp dụng',
  'Hỗ trợ thủ tục trả góp 0% và đăng ký biển số',
  'Giao xe tận nhà, hướng dẫn sử dụng và bảo dưỡng',
];

const SHOWROOMS = [
  {
    title: 'Showroom Quận 7',
    caption: 'TP. Hồ Chí Minh',
    text: '123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh',
    label: '0900 000 001',
    value: '8:00 – 21:00 hằng ngày',
    href: 'https://maps.google.com/?q=Nguyen+Van+Linh+Quan+7',
    image: '/images/pages/showroom.webp',
  },
  {
    title: 'Showroom Gò Vấp',
    caption: 'TP. Hồ Chí Minh',
    text: '456 Quang Trung, Phường 10, Gò Vấp, TP. Hồ Chí Minh',
    label: '0900 000 002',
    value: '8:00 – 21:00 hằng ngày',
    href: 'https://maps.google.com/?q=Quang+Trung+Go+Vap',
    image: '/images/pages/about.webp',
  },
  {
    title: 'Showroom Biên Hòa',
    caption: 'Đồng Nai',
    text: '789 Phạm Văn Thuận, Tân Mai, Biên Hòa, Đồng Nai',
    label: '0900 000 003',
    value: '8:00 – 20:30 hằng ngày',
    href: 'https://maps.google.com/?q=Pham+Van+Thuan+Bien+Hoa',
    image: '/images/pages/service.webp',
  },
  {
    title: 'Showroom Cầu Giấy',
    caption: 'Hà Nội',
    text: '12 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    label: '0900 000 004',
    value: '8:00 – 21:00 hằng ngày',
    href: 'https://maps.google.com/?q=Tran+Thai+Tong+Cau+Giay',
    image: '/images/news/news-2.webp',
  },
  {
    title: 'Showroom Hải Châu',
    caption: 'Đà Nẵng',
    text: '34 Nguyễn Văn Linh, Nam Dương, Hải Châu, Đà Nẵng',
    label: '0900 000 005',
    value: '8:00 – 20:30 hằng ngày',
    href: 'https://maps.google.com/?q=Nguyen+Van+Linh+Da+Nang',
    image: '/images/news/news-6.webp',
  },
  {
    title: 'Showroom Ninh Kiều',
    caption: 'Cần Thơ',
    text: '56 Ba Tháng Hai, Xuân Khánh, Ninh Kiều, Cần Thơ',
    label: '0900 000 006',
    value: '8:00 – 20:30 hằng ngày',
    href: 'https://maps.google.com/?q=3+Thang+2+Ninh+Kieu',
    image: '/images/news/news-5.webp',
  },
];

const SERVICE_COMMITMENTS = [
  { icon: 'truck', title: 'Miễn phí vận chuyển', text: 'Giao xe tận nhà nội thành' },
  { icon: 'wallet', title: 'Thanh toán khi nhận', text: 'Kiểm tra xe rồi mới trả tiền' },
  { icon: 'refresh', title: 'Đổi trả 7 ngày', text: 'Lỗi do nhà sản xuất' },
  { icon: 'shield', title: 'Bảo hành chính hãng', text: 'Trên toàn quốc, tận nơi' },
];

const HOME_FAQ = [
  {
    question: 'Mua xe điện trả góp cần giấy tờ gì?',
    answer: 'Chỉ cần căn cước công dân gắn chip và số điện thoại chính chủ. Hồ sơ được duyệt online trong khoảng 30 phút, trả trước từ 0–30% tuỳ gói.',
  },
  {
    question: 'Xe máy điện có cần bằng lái và đăng ký biển số không?',
    answer: 'Phần lớn xe máy điện thuộc loại xe gắn máy (tốc độ thiết kế không quá 50 km/h, động cơ không quá 4 kW): người lái từ đủ 16 tuổi, không cần bằng lái nhưng phải đăng ký biển số. Xe điện công suất lớn hơn được xếp vào mô tô và cần giấy phép lái xe hạng phù hợp.\n\nQuy định có thể thay đổi — chúng tôi hướng dẫn và hỗ trợ đăng ký biển số trọn gói khi mua xe.',
  },
  {
    question: 'Một lần sạc đi được bao xa?',
    answer: 'Tuỳ dung lượng pin: xe đạp điện thường 50–80 km, xe máy điện 70–150 km mỗi lần sạc đầy. Quãng đường thực tế phụ thuộc tải trọng, tốc độ và địa hình.',
  },
  {
    question: 'Pin lithium hay ắc quy chì tốt hơn?',
    answer: 'Pin lithium nhẹ, sạc nhanh, tuổi thọ 1.000–2.000 lần sạc nhưng giá cao hơn. Ắc quy chì rẻ, dễ thay thế, phù hợp nhu cầu đi lại ngắn. Nhân viên sẽ tư vấn loại phù hợp với quãng đường hằng ngày của bạn.',
  },
  {
    question: 'Bảo hành xe như thế nào?',
    answer: 'Động cơ bảo hành 24–36 tháng, pin / ắc quy 12–24 tháng tuỳ mẫu. Bảo hành tại toàn bộ hệ thống showroom và có kỹ thuật viên hỗ trợ tận nhà trong nội thành.',
  },
  {
    question: 'Có giao xe và lắp ráp tận nhà không?',
    answer: 'Có. Miễn phí giao xe nội thành các thành phố có showroom, giao toàn quốc qua đối tác vận chuyển. Xe được lắp ráp, kiểm tra và sạc sẵn trước khi bàn giao.',
  },
];

export const PAGES: PageDefinition[] = [
  {
    page: {
      title: 'Trang chủ',
      slug: 'home',
      eyebrow: 'Xe điện chính hãng',
      lead: 'Xe đạp điện, xe máy điện, xe điện 3 bánh, ô tô điện, xe chuyên dụng và phụ tùng chính hãng — giá tận xưởng, trả góp 0%.',
      templateKey: 'home',
      status: PublishStatus.PUBLISHED,
      sortOrder: 1,
      metaTitle: 'Xe Điện Xanh — Xe đạp điện, xe máy điện chính hãng, giá tận xưởng',
      metaDescription:
        'Hệ thống phân phối xe đạp điện, xe máy điện, xe điện 3 bánh, ô tô điện, xe chuyên dụng và phụ tùng chính hãng. Giao xe tận nhà, bảo hành toàn quốc, trả góp 0%.',
    },
    sections: [
      {
        sectionKey: 'banner',
        heading: 'Xe Điện Xanh — xe điện chính hãng, giá tận xưởng, trả góp 0%',
        metadata: {
          _component: 'hero',
          layout: 'banner',
          slides: [
            {
              image: '/images/hero/hero-1.webp',
              title: 'Xe máy điện chính hãng – giá tận xưởng',
              text: 'Hơn 40 mẫu xe máy điện, xe đạp điện sẵn hàng. Giao xe tận nhà, lắp ráp và sạc sẵn miễn phí.',
              label: 'Xem xe máy điện',
              href: '/danh-muc/xe-may-dien/',
              alt: 'Xe máy điện chạy trên phố',
            },
            {
              image: '/images/hero/hero-2.webp',
              title: 'Trả góp 0% – nhận xe chỉ từ 3 triệu',
              text: 'Duyệt hồ sơ trong 30 phút chỉ với căn cước công dân, không cần chứng minh thu nhập.',
              label: 'Đăng ký trả góp',
              href: '/mua-tra-gop/',
              alt: 'Người đi xe điện trong thành phố',
            },
            {
              image: '/images/hero/hero-3.webp',
              title: 'Xe điện du lịch, sân golf cho khu nghỉ dưỡng',
              text: 'Giải pháp đưa đón khách 4–14 chỗ, bảo trì định kỳ tận nơi, giá tốt cho dự án.',
              label: 'Nhận báo giá dự án',
              href: '/danh-muc/o-to-dien/',
              alt: 'Đoàn xe điện sân golf',
            },
            {
              image: '/images/hero/hero-4.webp',
              title: 'Trạm sạc, thay pin, sửa chữa xe điện tận nơi',
              text: 'Kỹ thuật viên lưu động có mặt trong 60 phút ở nội thành — thay ắc quy, vá lốp, kiểm tra điện.',
              label: 'Gọi kỹ thuật',
              href: '/sua-chua-tan-noi/',
              alt: 'Trụ sạc xe điện',
            },
          ],
          ctaLabel: 'Tư vấn ngay',
          ctaHref: '#tu-van',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'uu-dai',
        metadata: {
          _component: 'promo-tiles',
          items: [
            { icon: 'gift', title: 'Khuyến mãi!', text: 'Mua xe nhận ngay quà tặng đến 2 triệu', href: '/tin-tuc/?category=khuyen-mai' },
            { icon: 'card', title: 'Mua trả góp 0%', text: 'Áp dụng cho tất cả sản phẩm', href: '/mua-tra-gop/' },
            { icon: 'briefcase', title: 'Tuyển dụng', text: 'Tư vấn bán hàng, kỹ thuật viên xe điện', href: '/tuyen-dung/' },
          ],
        },
        sortOrder: 2,
      },
      {
        sectionKey: 'mua-nhieu',
        heading: 'Sản phẩm mua nhiều',
        metadata: {
          _component: 'product-grid',
          layout: 'grid',
          source: 'featured',
          limit: '10',
          ctaLabel: 'Xem tất cả',
          ctaHref: '/san-pham/',
        },
        sortOrder: 3,
      },
      {
        sectionKey: 'danh-muc',
        heading: 'Danh mục sản phẩm',
        metadata: {
          _component: 'category-grid',
          layout: 'tiles',
          limit: '12',
        },
        sortOrder: 4,
      },
      {
        sectionKey: 'moi-ve',
        heading: 'Sản phẩm mới về',
        metadata: {
          _component: 'product-grid',
          layout: 'rail',
          source: 'newest',
          limit: '12',
          ctaLabel: 'Xem thêm',
          ctaHref: '/san-pham/?sort=newest',
        },
        sortOrder: 5,
      },
      {
        sectionKey: 'xe-dap-dien',
        heading: 'Xe đạp điện',
        metadata: {
          _component: 'product-grid',
          layout: 'split',
          source: 'category',
          categorySlug: 'xe-dap-dien',
          limit: '8',
          ctaLabel: 'Xem tất cả xe đạp điện',
        },
        sortOrder: 6,
      },
      {
        sectionKey: 'xe-may-dien',
        heading: 'Xe máy điện',
        metadata: {
          _component: 'product-grid',
          layout: 'split',
          source: 'category',
          categorySlug: 'xe-may-dien',
          limit: '8',
          ctaLabel: 'Xem tất cả xe máy điện',
        },
        sortOrder: 7,
      },
      {
        sectionKey: 'xe-dien-2-banh',
        heading: 'Scooter điện & xe cân bằng',
        metadata: {
          _component: 'product-grid',
          layout: 'grid',
          source: 'category',
          categorySlug: 'xe-dien-2-banh',
          limit: '5',
          ctaLabel: 'Xem tất cả',
        },
        sortOrder: 8,
      },
      {
        sectionKey: 'o-to-dien',
        heading: 'Ô tô điện – xe du lịch, sân golf',
        metadata: {
          _component: 'product-grid',
          layout: 'split',
          source: 'category',
          categorySlug: 'o-to-dien',
          limit: '8',
          ctaLabel: 'Xem tất cả ô tô điện',
        },
        sortOrder: 9,
      },
      {
        sectionKey: 'xe-chuyen-dung',
        heading: 'Xe chuyên dụng & xe nâng điện',
        metadata: {
          _component: 'product-grid',
          layout: 'grid',
          source: 'category',
          categorySlug: 'xe-chuyen-dung',
          limit: '5',
          ctaLabel: 'Xem tất cả',
        },
        sortOrder: 10,
      },
      {
        sectionKey: 'phu-tung',
        heading: 'Phụ tùng & pin sạc',
        metadata: {
          _component: 'product-grid',
          layout: 'rail',
          source: 'category',
          categorySlug: 'phu-tung',
          limit: '10',
          ctaLabel: 'Xem tất cả phụ tùng',
        },
        sortOrder: 11,
      },
      {
        sectionKey: 'cam-ket',
        metadata: {
          _component: 'service-strip',
          items: SERVICE_COMMITMENTS,
        },
        sortOrder: 12,
      },
      {
        sectionKey: 'vi-sao-chon',
        heading: 'Vì sao khách hàng chọn Xe Điện Xanh',
        content: '<p>Hơn 10 năm phân phối xe điện, chúng tôi hiểu một chiếc xe tốt phải đi kèm dịch vụ sau bán hàng tốt.</p>',
        metadata: {
          _component: 'feature-cards',
          items: [
            { icon: 'shield', title: 'Hàng chính hãng 100%', text: 'Nhập trực tiếp từ nhà máy, đầy đủ hoá đơn VAT, phiếu bảo hành và giấy tờ đăng ký.' },
            { icon: 'percent', title: 'Giá tận xưởng', text: 'Cam kết giá tốt khu vực. Thấy nơi khác rẻ hơn, chúng tôi hoàn lại phần chênh lệch.' },
            { icon: 'card', title: 'Trả góp 0% lãi suất', text: 'Duyệt nhanh trong 30 phút, chỉ cần căn cước công dân, trả trước từ 0%.' },
            { icon: 'wrench', title: 'Sửa chữa tận nơi', text: 'Đội kỹ thuật lưu động hỗ trợ thay pin, vá lốp, kiểm tra điện ngay tại nhà.' },
            { icon: 'truck', title: 'Giao xe toàn quốc', text: 'Miễn phí giao nội thành, đóng gói kỹ và hỗ trợ lắp ráp khi giao tỉnh.' },
            { icon: 'headset', title: 'Tư vấn 8:00 – 21:00', text: 'Tổng đài miễn phí, Zalo và Messenger luôn có người trả lời trong vài phút.' },
          ],
        },
        sortOrder: 13,
      },
      {
        sectionKey: 'thuong-hieu',
        heading: 'Thương hiệu phân phối',
        metadata: {
          _component: 'marquee',
          items: ['Vnbike', 'YAKA', 'Pega', 'DYLEXE', 'TAILG', 'Osakar', 'Asama', 'Yadea', 'VinFast', 'Dat Bike', 'SEALUP', 'Teverun', 'Santong', 'Smart'],
        },
        sortOrder: 14,
      },
      {
        sectionKey: 'tin-tuc',
        heading: 'Tin tức & kinh nghiệm',
        metadata: {
          _component: 'post-list',
          layout: 'list',
          limit: '5',
          ctaLabel: 'Xem tất cả tin tức',
          ctaHref: '/tin-tuc/',
        },
        sortOrder: 15,
      },
      {
        sectionKey: 'hoi-dap',
        heading: 'Câu hỏi thường gặp',
        metadata: {
          _component: 'faq',
          layout: 'columns',
          headingAccent: 'thường gặp',
          items: HOME_FAQ,
        },
        sortOrder: 16,
      },
      {
        sectionKey: 'showroom',
        heading: 'Hệ thống showroom',
        content: '<p>Ghé showroom gần nhất để xem xe, lái thử và nhận ưu đãi trực tiếp.</p>',
        metadata: {
          _component: 'store-list',
          layout: 'grid',
          items: SHOWROOMS.slice(0, 3),
          mapLabel: 'Xem bản đồ',
          ctaLabel: 'Xem tất cả showroom',
          ctaHref: '/he-thong-showroom/',
        },
        sortOrder: 17,
      },
      {
        sectionKey: 'tu-van',
        heading: 'Đăng ký nhận tư vấn & báo giá',
        content: '<p>Chưa biết chọn mẫu xe nào? Để lại số điện thoại, chuyên viên sẽ gọi lại trong 15 phút.</p>',
        metadata: {
          _component: 'quote-form',
          items: CONSULT_BENEFITS,
          defaultType: 'consult',
          formTitle: 'Đăng ký tư vấn miễn phí',
          formSubtitle: 'Gọi lại trong 15 phút (8:00 – 21:00 hằng ngày).',
          submitLabel: 'Gửi yêu cầu tư vấn',
          backdropImage: '/images/pages/charging.webp',
        },
        sortOrder: 18,
      },
    ],
  },
  {
    page: {
      title: 'Tất cả sản phẩm',
      slug: 'products',
      lead: 'Xe đạp điện, xe máy điện, xe điện 3 bánh, ô tô điện, xe chuyên dụng, phụ tùng và trạm sạc chính hãng — giá tận xưởng, trả góp 0%, giao xe tận nhà.',
      templateKey: 'products',
      status: PublishStatus.PUBLISHED,
      sortOrder: 2,
      metaTitle: 'Sản phẩm xe điện chính hãng — giá tận xưởng',
      metaDescription:
        'Danh sách xe đạp điện, xe máy điện, scooter điện, xe 3 bánh, ô tô điện, xe nâng điện và phụ tùng chính hãng tại Xe Điện Xanh.',
    },
    sections: [],
  },
  {
    page: {
      title: 'Tin tức xe điện',
      slug: 'news',
      lead: 'Kinh nghiệm chọn xe, hướng dẫn sử dụng – bảo dưỡng, đánh giá mẫu mới và chương trình khuyến mãi.',
      templateKey: 'news',
      status: PublishStatus.PUBLISHED,
      sortOrder: 3,
      metaTitle: 'Tin tức xe điện, kinh nghiệm & khuyến mãi',
      metaDescription: 'Cập nhật tin tức xe điện, hướng dẫn sử dụng, bảo dưỡng pin và các chương trình khuyến mãi mới nhất.',
    },
    sections: [],
  },
  {
    page: {
      title: 'Liên hệ',
      slug: 'contact',
      eyebrow: 'Liên hệ',
      lead: 'Đội ngũ tư vấn trực 8:00 – 21:00 mỗi ngày. Gọi tổng đài miễn phí hoặc để lại lời nhắn, chúng tôi phản hồi ngay.',
      heroImagePath: '/images/pages/showroom.webp',
      templateKey: 'contact',
      status: PublishStatus.PUBLISHED,
      sortOrder: 4,
      metaTitle: 'Liên hệ Xe Điện Xanh',
      metaDescription: 'Hotline, địa chỉ showroom và form liên hệ của Xe Điện Xanh. Tư vấn miễn phí 8:00 – 21:00 hằng ngày.',
    },
    sections: [
      {
        sectionKey: 'thong-tin',
        heading: 'Thông tin liên hệ',
        content: '<p>Bạn cần tư vấn chọn xe, hỏi về bảo hành hay hợp tác đại lý? Liên hệ theo một trong các cách dưới đây.</p>',
        metadata: {
          _component: 'contact',
          layout: 'form',
          labelLocation: 'Khu vực',
          labelAddress: 'Văn phòng',
          labelEmail: 'Email',
          labelPhone: 'Hotline mua hàng',
          labelHours: 'Giờ làm việc',
          note: 'Khiếu nại về sản phẩm và dịch vụ, vui lòng gọi tổng đài miễn phí — chúng tôi xử lý trong 24 giờ.',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'showroom',
        heading: 'Hệ thống showroom',
        metadata: {
          _component: 'store-list',
          layout: 'list',
          items: SHOWROOMS,
          mapLabel: 'Xem bản đồ',
        },
        sortOrder: 2,
      },
    ],
  },
  {
    page: {
      title: 'Giới thiệu Xe Điện Xanh',
      slug: 'gioi-thieu',
      eyebrow: 'Về chúng tôi',
      lead: 'Hơn 10 năm đồng hành cùng người Việt chuyển sang phương tiện điện — tiết kiệm, êm ái và thân thiện với môi trường.',
      heroImagePath: '/images/pages/about.webp',
      status: PublishStatus.PUBLISHED,
      sortOrder: 5,
      metaTitle: 'Giới thiệu Xe Điện Xanh',
      metaDescription: 'Xe Điện Xanh — hệ thống phân phối xe điện chính hãng với showroom tại nhiều tỉnh thành, dịch vụ bảo hành và sửa chữa tận nơi.',
    },
    sections: [
      {
        sectionKey: 'cau-chuyen',
        heading: 'Câu chuyện của chúng tôi',
        content:
          '<p>Xe Điện Xanh bắt đầu từ một cửa hàng nhỏ chuyên sửa xe đạp điện. Nhận thấy khách hàng cần một nơi vừa bán xe chính hãng, vừa chăm sóc xe lâu dài, chúng tôi xây dựng hệ thống showroom kèm xưởng dịch vụ.</p>' +
          '<p>Hôm nay, chúng tôi phân phối hàng trăm mẫu xe điện từ xe đạp điện cho học sinh đến ô tô điện cho khu du lịch, xe nâng điện cho nhà xưởng — tất cả đều có bảo hành chính hãng và kỹ thuật viên hỗ trợ tận nơi.</p>',
        metadata: {
          _component: 'icon-card-list',
          layout: 'split',
          image: '/images/pages/about.webp',
          imageAlt: 'Cửa hàng xe điện',
          image2: '/images/pages/service.webp',
          image2Alt: 'Xưởng sửa chữa xe điện',
          badge: '10+|năm kinh nghiệm',
          ctaLabel: 'Xem hệ thống showroom',
          ctaHref: '/he-thong-showroom/',
          items: [
            { icon: 'bolt', title: 'Sứ mệnh', text: 'Giúp mọi gia đình Việt sở hữu phương tiện điện chất lượng với chi phí hợp lý.' },
            { icon: 'star', title: 'Tầm nhìn', text: 'Trở thành hệ thống bán lẻ và dịch vụ xe điện được tin chọn hàng đầu.' },
            { icon: 'users', title: 'Giá trị cốt lõi', text: 'Trung thực trong tư vấn, tận tâm sau bán hàng, minh bạch về giá.' },
          ],
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'con-so',
        heading: 'Những con số',
        metadata: {
          _component: 'stats',
          stats: [
            { label: 'Khách hàng tin dùng', value: '50.000+' },
            { label: 'Showroom & đại lý', value: '13' },
            { label: 'Mẫu xe sẵn hàng', value: '300+' },
            { label: 'Kỹ thuật viên', value: '40+' },
          ],
        },
        sortOrder: 2,
      },
      {
        sectionKey: 'vi-sao-chon',
        heading: 'Điều làm nên khác biệt',
        metadata: {
          _component: 'feature-cards',
          items: [
            { icon: 'shield', title: 'Chính hãng, minh bạch', text: 'Mọi xe đều có hoá đơn, phiếu bảo hành và nguồn gốc rõ ràng.' },
            { icon: 'wrench', title: 'Xưởng dịch vụ riêng', text: 'Bảo dưỡng, thay pin, sửa chữa ngay tại showroom hoặc tận nhà.' },
            { icon: 'card', title: 'Tài chính linh hoạt', text: 'Liên kết nhiều công ty tài chính, trả góp 0% qua thẻ tín dụng.' },
          ],
        },
        sortOrder: 3,
      },
      {
        sectionKey: 'hinh-anh',
        heading: 'Hình ảnh hoạt động',
        metadata: {
          _component: 'photo-strip',
          items: [
            { image: '/images/pages/showroom.webp', caption: 'Không gian trưng bày' },
            { image: '/images/pages/service.webp', caption: 'Xưởng dịch vụ' },
            { image: '/images/pages/delivery.webp', caption: 'Giao xe tận nhà' },
          ],
          note: 'Đến showroom để trải nghiệm và lái thử miễn phí.',
          ctaLabel: 'Liên hệ',
          ctaHref: '/lien-he/',
        },
        sortOrder: 4,
      },
    ],
  },
  {
    page: {
      title: 'Mua xe điện trả góp 0%',
      slug: 'mua-tra-gop',
      eyebrow: 'Trả góp',
      lead: 'Nhận xe ngay chỉ với căn cước công dân. Lãi suất 0%, duyệt hồ sơ trong 30 phút, trả trước từ 0%.',
      heroImagePath: '/images/pages/installment.webp',
      status: PublishStatus.PUBLISHED,
      sortOrder: 6,
      metaTitle: 'Mua xe điện trả góp 0% lãi suất',
      metaDescription: 'Mua xe đạp điện, xe máy điện trả góp 0% chỉ cần CCCD, duyệt hồ sơ 30 phút, trả trước từ 0% tại Xe Điện Xanh.',
    },
    sections: [
      {
        sectionKey: 'uu-diem',
        heading: 'Ưu điểm khi mua trả góp',
        metadata: {
          _component: 'feature-cards',
          items: [
            { icon: 'percent', title: 'Lãi suất 0%', text: 'Áp dụng kỳ hạn 6–12 tháng qua thẻ tín dụng của hơn 20 ngân hàng.' },
            { icon: 'clock', title: 'Duyệt trong 30 phút', text: 'Hồ sơ online, có kết quả ngay tại showroom hoặc qua điện thoại.' },
            { icon: 'card', title: 'Trả trước từ 0%', text: 'Nhiều gói linh hoạt qua công ty tài chính, chọn kỳ hạn 6–24 tháng.' },
          ],
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'quy-trinh',
        heading: 'Quy trình mua trả góp',
        metadata: {
          _component: 'steps',
          layout: 'circles',
          items: [
            { title: 'Chọn xe', text: 'Chọn mẫu xe và gói trả góp phù hợp với ngân sách.' },
            { title: 'Đăng ký', text: 'Gửi thông tin qua form, hotline hoặc tại showroom.' },
            { title: 'Thẩm định', text: 'Công ty tài chính xác minh và phê duyệt trong 30 phút.' },
            { title: 'Ký hợp đồng', text: 'Ký hợp đồng điện tử hoặc trực tiếp tại cửa hàng.' },
            { title: 'Nhận xe', text: 'Thanh toán khoản trả trước (nếu có) và nhận xe ngay.' },
          ],
        },
        sortOrder: 2,
      },
      {
        sectionKey: 'ho-so',
        heading: 'Hồ sơ cần chuẩn bị',
        metadata: {
          _component: 'checklist',
          items: [
            'Căn cước công dân gắn chip còn hạn',
            'Số điện thoại chính chủ',
            'Thẻ tín dụng (nếu trả góp 0% qua thẻ)',
            'Người mua từ 18 đến 60 tuổi',
          ],
          note: 'Không cần chứng minh thu nhập với khoản vay dưới 30 triệu đồng.',
        },
        sortOrder: 3,
      },
      {
        sectionKey: 'hoi-dap',
        heading: 'Hỏi đáp về trả góp',
        metadata: {
          _component: 'faq',
          layout: 'split',
          image: '/images/pages/installment.webp',
          imageAlt: 'Thanh toán bằng thẻ',
          items: [
            { question: 'Trả góp 0% có mất phí gì không?', answer: 'Với trả góp qua thẻ tín dụng, một số ngân hàng thu phí chuyển đổi 1–3%. Nhân viên sẽ báo rõ tổng chi phí trước khi ký.' },
            { question: 'Tôi có thể tất toán sớm không?', answer: 'Có thể tất toán bất kỳ lúc nào; phí tất toán (nếu có) theo quy định của công ty tài chính.' },
            { question: 'Học sinh, sinh viên có mua trả góp được không?', answer: 'Người dưới 18 tuổi cần bố mẹ hoặc người giám hộ đứng tên hợp đồng.' },
          ],
          note: 'Điều kiện cụ thể phụ thuộc chính sách từng ngân hàng / công ty tài chính tại thời điểm mua.',
        },
        sortOrder: 4,
      },
      {
        sectionKey: 'tu-van',
        heading: 'Đăng ký mua trả góp',
        content: '<p>Để lại thông tin, chuyên viên tính sẵn số tiền trả mỗi tháng cho mẫu xe bạn chọn.</p>',
        metadata: {
          _component: 'quote-form',
          items: ['Tính sẵn số tiền trả hằng tháng', 'Hỗ trợ hồ sơ từ A đến Z', 'Nhận xe ngay trong ngày'],
          defaultType: 'installment',
          formTitle: 'Đăng ký trả góp 0%',
          submitLabel: 'Gửi đăng ký',
        },
        sortOrder: 5,
      },
    ],
  },
  {
    page: {
      title: 'Hệ thống showroom',
      slug: 'he-thong-showroom',
      eyebrow: 'Showroom',
      lead: 'Ghé showroom gần nhất để xem xe, lái thử và nhận ưu đãi trực tiếp. Tất cả showroom đều có xưởng bảo hành.',
      heroImagePath: '/images/pages/showroom.webp',
      status: PublishStatus.PUBLISHED,
      sortOrder: 7,
      metaTitle: 'Hệ thống showroom Xe Điện Xanh',
      metaDescription: 'Địa chỉ, số điện thoại và giờ mở cửa các showroom Xe Điện Xanh tại TP. Hồ Chí Minh, Đồng Nai, Hà Nội, Đà Nẵng, Cần Thơ.',
    },
    sections: [
      {
        sectionKey: 'danh-sach',
        heading: 'Showroom gần bạn',
        metadata: {
          _component: 'store-list',
          layout: 'grid',
          items: SHOWROOMS,
          mapLabel: 'Xem bản đồ',
          note: 'Muốn mở đại lý tại địa phương của bạn?',
          ctaLabel: 'Xem chính sách đại lý',
          ctaHref: '/chinh-sach-dai-ly/',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'cam-ket',
        metadata: { _component: 'service-strip', items: SERVICE_COMMITMENTS },
        sortOrder: 2,
      },
    ],
  },
  {
    page: {
      title: 'Chính sách bảo hành',
      slug: 'chinh-sach-bao-hanh',
      eyebrow: 'Chính sách',
      lead: 'Bảo hành chính hãng trên toàn quốc, hỗ trợ kỹ thuật tận nơi trong nội thành.',
      heroImagePath: '/images/pages/service.webp',
      status: PublishStatus.PUBLISHED,
      sortOrder: 8,
      metaTitle: 'Chính sách bảo hành xe điện',
      metaDescription: 'Thời hạn và điều kiện bảo hành động cơ, pin, bộ điều khiển xe điện tại Xe Điện Xanh.',
    },
    sections: [
      {
        sectionKey: 'noi-dung',
        heading: 'Chính sách bảo hành',
        content:
          '<h2>1. Thời hạn bảo hành</h2>' +
          '<table><thead><tr><th>Bộ phận</th><th>Xe đạp điện / xe máy điện</th><th>Ô tô điện / xe chuyên dụng</th></tr></thead>' +
          '<tbody><tr><td>Động cơ</td><td>24–36 tháng</td><td>12–24 tháng</td></tr>' +
          '<tr><td>Bộ điều khiển (IC)</td><td>12 tháng</td><td>12 tháng</td></tr>' +
          '<tr><td>Pin lithium</td><td>12–24 tháng</td><td>24 tháng</td></tr>' +
          '<tr><td>Ắc quy chì</td><td>6–12 tháng</td><td>12 tháng</td></tr>' +
          '<tr><td>Bộ sạc</td><td>6–12 tháng</td><td>12 tháng</td></tr></tbody></table>' +
          '<h2>2. Điều kiện bảo hành</h2><ul><li>Còn thời hạn bảo hành, có phiếu bảo hành hoặc thông tin mua hàng trên hệ thống.</li><li>Lỗi do nhà sản xuất (vật liệu, lắp ráp, linh kiện điện tử).</li><li>Tem bảo hành, số khung, số máy còn nguyên vẹn.</li></ul>' +
          '<h2>3. Trường hợp không bảo hành</h2><ul><li>Xe bị ngập nước, cháy nổ, tai nạn hoặc tự ý sửa chữa, độ chế.</li><li>Hao mòn tự nhiên: lốp, má phanh, dây phanh, bóng đèn, nhựa, sơn.</li><li>Sạc sai bộ sạc hoặc để pin cạn kiệt kéo dài.</li></ul>' +
          '<h2>4. Quy trình bảo hành</h2><p>Mang xe đến showroom gần nhất hoặc gọi tổng đài để được kỹ thuật viên hỗ trợ tận nơi. Thời gian xử lý thông thường từ 1–3 ngày làm việc; trường hợp phải đổi linh kiện từ hãng tối đa 15 ngày, chúng tôi hỗ trợ xe đi tạm nếu cần.</p>',
        metadata: {
          _component: 'rich-text',
          layout: 'aside',
          asideTitle: 'Hotline bảo hành',
          asideText: 'Gọi tổng đài miễn phí hoặc nhắn Zalo kèm ảnh / video lỗi, kỹ thuật viên sẽ tư vấn ngay.\n\nThời gian hỗ trợ: 8:00 – 21:00 hằng ngày.',
          ctaLabel: 'Đặt lịch sửa chữa',
          ctaHref: '/sua-chua-tan-noi/',
        },
        sortOrder: 1,
      },
    ],
  },
  {
    page: {
      title: 'Chính sách vận chuyển',
      slug: 'chinh-sach-van-chuyen',
      eyebrow: 'Chính sách',
      lead: 'Miễn phí giao xe nội thành, giao toàn quốc qua đối tác vận chuyển uy tín.',
      heroImagePath: '/images/pages/delivery.webp',
      status: PublishStatus.PUBLISHED,
      sortOrder: 9,
      metaTitle: 'Chính sách vận chuyển, giao xe',
      metaDescription: 'Phí và thời gian giao xe điện nội thành, liên tỉnh tại Xe Điện Xanh.',
    },
    sections: [
      {
        sectionKey: 'noi-dung',
        heading: 'Chính sách vận chuyển',
        content:
          '<h2>1. Phạm vi và phí giao hàng</h2><ul><li><strong>Nội thành</strong> các thành phố có showroom: miễn phí giao xe và lắp ráp.</li><li><strong>Ngoại thành / liên tỉnh</strong>: phí theo bảng giá của đối tác vận chuyển, báo trước khi chốt đơn.</li><li>Phụ tùng, phụ kiện: miễn phí với đơn từ 500.000đ.</li></ul>' +
          '<h2>2. Thời gian giao</h2><p>Nội thành trong 24 giờ; liên tỉnh 2–5 ngày làm việc tuỳ khu vực.</p>' +
          '<h2>3. Kiểm tra khi nhận</h2><p>Quý khách được kiểm tra ngoại quan, chạy thử xe trước khi thanh toán. Nếu xe trầy xước, thiếu phụ kiện do vận chuyển, vui lòng từ chối nhận và báo ngay tổng đài để được đổi xe mới.</p>',
        metadata: { _component: 'rich-text', layout: 'article' },
        sortOrder: 1,
      },
    ],
  },
  {
    page: {
      title: 'Chính sách đổi trả',
      slug: 'chinh-sach-doi-tra',
      eyebrow: 'Chính sách',
      lead: 'Đổi trả trong 7 ngày với lỗi do nhà sản xuất.',
      heroImagePath: '/images/pages/showroom.webp',
      status: PublishStatus.PUBLISHED,
      sortOrder: 10,
      metaTitle: 'Chính sách đổi trả',
      metaDescription: 'Điều kiện và quy trình đổi trả xe điện, phụ tùng tại Xe Điện Xanh.',
    },
    sections: [
      {
        sectionKey: 'noi-dung',
        heading: 'Chính sách đổi trả',
        content:
          '<h2>1. Điều kiện đổi trả</h2><ul><li>Trong 7 ngày kể từ ngày nhận xe.</li><li>Lỗi kỹ thuật do nhà sản xuất, được kỹ thuật viên xác nhận.</li><li>Xe còn đầy đủ phụ kiện, hộp, sách hướng dẫn, chưa đăng ký biển số.</li></ul>' +
          '<h2>2. Hình thức</h2><p>Đổi xe cùng mẫu (hoặc mẫu khác, bù trừ chênh lệch). Trường hợp không còn hàng thay thế, hoàn tiền 100% trong 3 ngày làm việc.</p>' +
          '<h2>3. Không áp dụng</h2><p>Xe hư hỏng do sử dụng sai hướng dẫn, va chạm, ngập nước; phụ tùng đã lắp đặt.</p>',
        metadata: { _component: 'rich-text', layout: 'article' },
        sortOrder: 1,
      },
    ],
  },
  {
    page: {
      title: 'Hướng dẫn mua hàng',
      slug: 'huong-dan-mua-hang',
      eyebrow: 'Hỗ trợ',
      lead: 'Mua xe online, tại showroom hoặc qua điện thoại — đơn giản trong 3 bước.',
      heroImagePath: '/images/pages/delivery.webp',
      status: PublishStatus.PUBLISHED,
      sortOrder: 11,
      metaTitle: 'Hướng dẫn mua xe điện online',
      metaDescription: 'Các bước đặt mua xe điện online, thanh toán và nhận xe tại Xe Điện Xanh.',
    },
    sections: [
      {
        sectionKey: 'cac-buoc',
        heading: 'Mua hàng trong 3 bước',
        metadata: {
          _component: 'steps',
          layout: 'circles',
          items: [
            { title: 'Chọn xe', text: 'Xem sản phẩm trên website hoặc gọi hotline để được tư vấn.' },
            { title: 'Đặt hàng', text: 'Để lại thông tin ở form tư vấn, nhân viên gọi lại xác nhận màu, giá, quà tặng.' },
            { title: 'Nhận xe', text: 'Nhận xe tại nhà hoặc showroom, kiểm tra rồi mới thanh toán.' },
          ],
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'thanh-toan',
        heading: 'Hình thức thanh toán',
        content:
          '<ul><li>Tiền mặt khi nhận xe (COD).</li><li>Chuyển khoản ngân hàng — giảm thêm cho một số mẫu xe.</li><li>Quẹt thẻ ATM, Visa, Mastercard tại showroom.</li><li>Trả góp 0% qua thẻ tín dụng hoặc công ty tài chính.</li></ul>',
        metadata: { _component: 'rich-text', layout: 'article' },
        sortOrder: 2,
      },
      {
        sectionKey: 'tu-van',
        heading: 'Cần hỗ trợ đặt hàng?',
        metadata: { _component: 'quote-form', items: CONSULT_BENEFITS, defaultType: 'quote' },
        sortOrder: 3,
      },
    ],
  },
  {
    page: {
      title: 'Sửa chữa xe điện tận nơi',
      slug: 'sua-chua-tan-noi',
      eyebrow: 'Dịch vụ',
      lead: 'Kỹ thuật viên lưu động có mặt trong 60 phút ở nội thành: thay ắc quy, vá lốp, sửa điện, bảo dưỡng định kỳ.',
      heroImagePath: '/images/pages/service.webp',
      status: PublishStatus.PUBLISHED,
      sortOrder: 12,
      metaTitle: 'Sửa chữa xe điện tận nơi, cứu hộ xe điện',
      metaDescription: 'Dịch vụ sửa chữa, thay pin, cứu hộ xe đạp điện, xe máy điện tận nơi trong 60 phút.',
    },
    sections: [
      {
        sectionKey: 'dich-vu',
        heading: 'Dịch vụ tận nơi',
        metadata: {
          _component: 'icon-card-list',
          layout: 'list',
          items: [
            { icon: 'battery', title: 'Thay pin, ắc quy tại nhà', text: 'Mang sẵn ắc quy / pin chính hãng, thay và thu lại pin cũ trong 30 phút.' },
            { icon: 'tire', title: 'Vá lốp, thay săm lốp', text: 'Hỗ trợ dọc đường khi xe bị thủng lốp, xẹp lốp.' },
            { icon: 'wrench', title: 'Sửa điện, IC, động cơ', text: 'Kiểm tra lỗi bằng thiết bị chuyên dụng, báo giá trước khi sửa.' },
            { icon: 'shield', title: 'Bảo dưỡng định kỳ', text: 'Vệ sinh, tra dầu, kiểm tra phanh và hệ thống điện 6 tháng / lần.' },
          ],
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'tu-van',
        heading: 'Đặt lịch kỹ thuật',
        content: '<p>Mô tả tình trạng xe, chúng tôi gọi lại báo giá và thời gian có mặt.</p>',
        metadata: {
          _component: 'quote-form',
          items: ['Có mặt trong 60 phút nội thành', 'Báo giá trước, không phát sinh', 'Linh kiện chính hãng, bảo hành sau sửa'],
          defaultType: 'consult',
          formTitle: 'Đặt lịch sửa chữa',
          submitLabel: 'Gửi yêu cầu',
        },
        sortOrder: 2,
      },
    ],
  },
  {
    page: {
      title: 'Tuyển dụng',
      slug: 'tuyen-dung',
      eyebrow: 'Cơ hội nghề nghiệp',
      lead: 'Gia nhập đội ngũ Xe Điện Xanh — môi trường năng động, thu nhập hấp dẫn, được đào tạo bài bản.',
      heroImagePath: '/images/pages/about.webp',
      status: PublishStatus.PUBLISHED,
      sortOrder: 13,
      metaTitle: 'Tuyển dụng Xe Điện Xanh',
      metaDescription: 'Tuyển dụng nhân viên tư vấn bán hàng, kỹ thuật viên sửa chữa xe điện tại hệ thống Xe Điện Xanh.',
    },
    sections: [
      {
        sectionKey: 'vi-tri',
        heading: 'Vị trí đang tuyển',
        metadata: {
          _component: 'faq',
          layout: 'columns',
          items: [
            { question: 'Nhân viên tư vấn bán hàng (TP.HCM, Hà Nội)', answer: 'Tư vấn khách tại showroom và qua điện thoại, chăm sóc khách sau bán.\n\nThu nhập 8–20 triệu (lương cứng + thưởng doanh số). Ưu tiên có kinh nghiệm bán lẻ.' },
            { question: 'Kỹ thuật viên sửa chữa xe điện', answer: 'Lắp ráp, bảo dưỡng, sửa chữa xe điện tại xưởng và tận nhà khách.\n\nThu nhập 9–18 triệu. Được đào tạo thêm nếu chưa có kinh nghiệm xe điện.' },
            { question: 'Nhân viên giao xe', answer: 'Giao xe, hướng dẫn khách sử dụng cơ bản. Có bằng lái B2 là lợi thế.\n\nThu nhập 7–12 triệu + phụ cấp.' },
            { question: 'Cách ứng tuyển', answer: 'Gửi CV qua email lienhe@xedienxanh.vn với tiêu đề "Ứng tuyển – Vị trí – Họ tên", hoặc đến trực tiếp showroom gần nhất.' },
          ],
        },
        sortOrder: 1,
      },
    ],
  },
  {
    page: {
      title: 'Chính sách đại lý',
      slug: 'chinh-sach-dai-ly',
      eyebrow: 'Hợp tác',
      lead: 'Trở thành đại lý phân phối xe điện — chiết khấu hấp dẫn, hỗ trợ trưng bày, đào tạo kỹ thuật và marketing.',
      heroImagePath: '/images/pages/showroom.webp',
      status: PublishStatus.PUBLISHED,
      sortOrder: 14,
      metaTitle: 'Chính sách đại lý xe điện',
      metaDescription: 'Chính sách chiết khấu, hỗ trợ và điều kiện mở đại lý phân phối xe điện cùng Xe Điện Xanh.',
    },
    sections: [
      {
        sectionKey: 'quyen-loi',
        heading: 'Quyền lợi đại lý',
        metadata: {
          _component: 'feature-cards',
          items: [
            { icon: 'percent', title: 'Chiết khấu cạnh tranh', text: 'Chiết khấu theo sản lượng, thưởng quý và năm.' },
            { icon: 'store', title: 'Hỗ trợ trưng bày', text: 'Biển hiệu, kệ trưng bày, xe mẫu và ấn phẩm quảng cáo.' },
            { icon: 'wrench', title: 'Đào tạo kỹ thuật', text: 'Đào tạo lắp ráp, sửa chữa, bảo hành cho kỹ thuật viên đại lý.' },
          ],
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'tu-van',
        heading: 'Đăng ký làm đại lý',
        content: '<p>Để lại thông tin, bộ phận phát triển kênh sẽ liên hệ trong 24 giờ.</p>',
        metadata: {
          _component: 'quote-form',
          items: ['Không yêu cầu mặt bằng quá lớn', 'Hỗ trợ vốn hàng ban đầu', 'Bảo vệ vùng kinh doanh'],
          defaultType: 'dealer',
          formTitle: 'Đăng ký đại lý',
          submitLabel: 'Gửi đăng ký',
        },
        sortOrder: 2,
      },
    ],
  },
];

@Injectable()
export class PageSeed {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
    @InjectRepository(PageSection)
    private readonly sectionRepo: Repository<PageSection>,
  ) {}

  async run(): Promise<void> {
    let createdPages = 0;
    let createdSections = 0;
    let mergedSections = 0;

    for (const definition of PAGES) {
      let page = await this.pageRepo.findOne({
        where: { slug: definition.page.slug },
        withDeleted: true,
      });

      if (!page) {
        page = await this.pageRepo.save(this.pageRepo.create(definition.page));
        createdPages++;
      }

      for (const section of definition.sections) {
        const existing = await this.sectionRepo.findOne({
          where: { pageId: page.id, sectionKey: section.sectionKey },
          withDeleted: true,
        });

        if (existing) {
          const seedMetadata = (section.metadata ?? {}) as Record<string, unknown>;
          const currentMetadata = (existing.metadata ?? {}) as Record<string, unknown>;
          const missingKeys = Object.keys(seedMetadata).filter(
            (key) => !(key in currentMetadata),
          );
          if (missingKeys.length > 0) {
            existing.metadata = {
              ...currentMetadata,
              ...Object.fromEntries(
                missingKeys.map((key) => [key, seedMetadata[key]]),
              ),
            };
            await this.sectionRepo.save(existing);
            mergedSections++;
          }
          continue;
        }

        await this.sectionRepo.save(
          this.sectionRepo.create({ ...section, pageId: page.id }),
        );
        createdSections++;
      }
    }

    console.log(
      createdPages + createdSections + mergedSections > 0
        ? `--- [Seed] Pages: created ${createdPages} page(s), ${createdSections} section(s); merged metadata into ${mergedSections} section(s).`
        : '--- [Seed] Pages: nothing missing, skipping.',
    );
  }
}
