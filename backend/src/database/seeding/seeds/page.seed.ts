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
  'Khảo sát tận nơi, đề xuất số lượng và cấu hình xe phù hợp',
  'Báo giá dự án trong 24 giờ, giá tốt khi đặt đội xe',
  'Hỗ trợ trả góp, thuê tài chính, thuê theo tháng cho doanh nghiệp',
  'Bàn giao, đào tạo lái xe và bảo trì định kỳ tận nơi',
];

const SHOWROOMS = [
  {
    title: 'Showroom Quận 7',
    caption: 'TP. Hồ Chí Minh',
    text: '123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP. Hồ Chí Minh',
    label: '0900 000 001',
    value: '8:00 – 21:00 hằng ngày',
    href: 'https://maps.google.com/?q=Nguyen+Van+Linh+Quan+7',
    image: 'uploads/pages/showroom.webp',
  },
  {
    title: 'Showroom Gò Vấp',
    caption: 'TP. Hồ Chí Minh',
    text: '456 Quang Trung, Phường 10, Gò Vấp, TP. Hồ Chí Minh',
    label: '0900 000 002',
    value: '8:00 – 21:00 hằng ngày',
    href: 'https://maps.google.com/?q=Quang+Trung+Go+Vap',
    image: 'uploads/pages/about.webp',
  },
  {
    title: 'Showroom Biên Hòa',
    caption: 'Đồng Nai',
    text: '789 Phạm Văn Thuận, Tân Mai, Biên Hòa, Đồng Nai',
    label: '0900 000 003',
    value: '8:00 – 20:30 hằng ngày',
    href: 'https://maps.google.com/?q=Pham+Van+Thuan+Bien+Hoa',
    image: 'uploads/pages/service.webp',
  },
  {
    title: 'Showroom Cầu Giấy',
    caption: 'Hà Nội',
    text: '12 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    label: '0900 000 004',
    value: '8:00 – 21:00 hằng ngày',
    href: 'https://maps.google.com/?q=Tran+Thai+Tong+Cau+Giay',
    image: 'uploads/news/news-2.webp',
  },
  {
    title: 'Showroom Hải Châu',
    caption: 'Đà Nẵng',
    text: '34 Nguyễn Văn Linh, Nam Dương, Hải Châu, Đà Nẵng',
    label: '0900 000 005',
    value: '8:00 – 20:30 hằng ngày',
    href: 'https://maps.google.com/?q=Nguyen+Van+Linh+Da+Nang',
    image: 'uploads/news/news-6.webp',
  },
  {
    title: 'Showroom Ninh Kiều',
    caption: 'Cần Thơ',
    text: '56 Ba Tháng Hai, Xuân Khánh, Ninh Kiều, Cần Thơ',
    label: '0900 000 006',
    value: '8:00 – 20:30 hằng ngày',
    href: 'https://maps.google.com/?q=3+Thang+2+Ninh+Kieu',
    image: 'uploads/news/news-5.webp',
  },
];

const SERVICE_COMMITMENTS = [
  { icon: 'truck', title: 'Giao xe toàn quốc', text: 'Bàn giao tận sân golf, resort, nhà xưởng' },
  { icon: 'wrench', title: 'Bảo trì tận nơi', text: 'Bảo dưỡng định kỳ, có xe thay thế' },
  { icon: 'box', title: 'Phụ tùng sẵn kho', text: 'Giao phụ tùng trong 24 giờ' },
  { icon: 'shield', title: 'Bảo hành 24 tháng', text: 'Động cơ, khung; pin lithium tới 36 tháng' },
];

const HOME_FAQ = [
  {
    question: 'Sân golf 18 hố cần bao nhiêu xe điện?',
    answer: 'Thông thường 50 – 80 xe golf 2 chỗ cho 18 hố, tuỳ lượng khách cuối tuần và số giờ mở cửa, cộng thêm 2 – 4 xe chở đồ cho đội chăm sóc sân. Chúng tôi khảo sát miễn phí và đề xuất số lượng, lịch sạc phù hợp.',
  },
  {
    question: 'Resort nên chọn xe 8 chỗ hay 11 – 14 chỗ?',
    answer: 'Xe 8 chỗ linh hoạt, đi được lối nhỏ giữa các villa và đón khách theo yêu cầu. Xe 11 – 14 chỗ hợp tuyến cố định đông khách như sảnh – bãi biển – nhà hàng. Đa số resort kết hợp cả hai, thêm xe buồng phòng và xe tuần tra.',
  },
  {
    question: 'Nên chọn ắc quy chì hay pin lithium?',
    answer: 'Ắc quy chì có giá đầu tư thấp, phù hợp đội xe chạy một ca. Pin lithium đắt hơn nhưng sạc nhanh 4 – 5 giờ, không bảo dưỡng nước, tuổi thọ 2.000+ chu kỳ — kinh tế hơn cho xe chạy nhiều ca, xe nâng và xe cho thuê.',
  },
  {
    question: 'Xe nâng điện có thay được xe nâng dầu không?',
    answer: 'Có. Xe nâng điện 1,5 – 3,5 tấn đáp ứng hầu hết công việc của xe nâng dầu, không khói, không ồn nên dùng được trong kho thực phẩm, dược phẩm. Chi phí điện và bảo dưỡng thấp hơn khoảng 50 – 60% so với dầu.',
  },
  {
    question: 'Có cho thuê xe nâng, xe golf theo tháng không?',
    answer: 'Có gói thuê ngắn hạn theo tháng (mùa cao điểm, dự án tạm thời) và thuê tài chính 12 – 60 tháng. Giá thuê đã gồm bảo trì định kỳ; hết hạn có thể mua lại xe với giá còn lại.',
  },
  {
    question: 'Bảo hành và bảo trì như thế nào?',
    answer: 'Động cơ và khung bảo hành 24 tháng, pin lithium tới 36 tháng; xe nâng 12 tháng hoặc 2.000 giờ. Kỹ thuật viên bảo dưỡng định kỳ tại chỗ, có xe thay thế khi xe lớn phải đưa về xưởng.',
  },
];

export const PAGES: PageDefinition[] = [
  {
    page: {
      title: 'Trang chủ',
      slug: 'home',
      eyebrow: 'Xe điện sân golf · resort · xe nâng',
      lead: 'Xe điện sân golf, xe điện du lịch cho resort – khách sạn và xe nâng điện chính hãng — báo giá dự án trong 24 giờ, bàn giao và bảo trì tận nơi.',
      templateKey: 'home',
      status: PublishStatus.PUBLISHED,
      sortOrder: 1,
      metaTitle: 'Xe Điện Xanh — Xe điện sân golf, xe điện resort, xe nâng điện chính hãng',
      metaDescription:
        'Chuyên xe điện sân golf 2 – 6 chỗ, xe điện du lịch 8 – 23 chỗ cho resort, khách sạn và xe nâng điện 1,2 – 3,5 tấn. Báo giá dự án 24h, giao xe toàn quốc, bảo trì tận nơi.',
    },
    sections: [
      {
        sectionKey: 'banner',
        heading: 'Xe Điện Xanh — xe điện sân golf, xe điện resort và xe nâng điện chính hãng',
        metadata: {
          _component: 'hero',
          layout: 'banner',
          slides: [
            {
              image: 'uploads/hero/hero-golf.webp',
              title: 'Xe điện sân golf 2 – 6 chỗ chính hãng',
              text: 'Đội xe golf êm, bền, leo dốc tốt cho sân golf và khu biệt thự. Bàn giao tận sân, bảo dưỡng định kỳ tại chỗ.',
              label: 'Xem xe sân golf',
              href: '/danh-muc/xe-dien-san-golf/',
              alt: 'Xe điện trên sân golf',
            },
            {
              image: 'uploads/hero/hero-resort.webp',
              title: 'Xe điện đưa đón khách cho resort, khách sạn',
              text: 'Xe 8 – 23 chỗ, xe cổ điển, xe tuần tra và xe buồng phòng — sơn theo nhận diện thương hiệu khu nghỉ dưỡng.',
              label: 'Xem xe resort',
              href: '/danh-muc/xe-dien-du-lich/',
              alt: 'Xe điện chở khách trong khu nghỉ dưỡng',
            },
            {
              image: 'uploads/hero/hero-xe-nang.webp',
              title: 'Xe nâng điện 1,2 – 3,5 tấn: bán, cho thuê, bảo trì',
              text: 'Xe nâng ngồi lái, reach truck, xe nâng tay điện pin lithium — thay xe nâng dầu, giảm tới 60% chi phí vận hành.',
              label: 'Xem xe nâng điện',
              href: '/danh-muc/xe-nang-dien/',
              alt: 'Xe nâng điện trong kho hàng',
            },
            {
              image: 'uploads/hero/hero-3.webp',
              title: 'Giải pháp đội xe trọn gói cho dự án',
              text: 'Khảo sát địa hình, tư vấn cấu hình, bàn giao – đào tạo lái xe và bảo trì định kỳ trong suốt vòng đời xe.',
              label: 'Nhận báo giá dự án',
              href: '#tu-van',
              alt: 'Đoàn xe điện sân golf',
            },
          ],
          ctaLabel: 'Nhận báo giá',
          ctaHref: '#tu-van',
        },
        sortOrder: 1,
      },
      {
        sectionKey: 'uu-dai',
        metadata: {
          _component: 'promo-tiles',
          items: [
            { icon: 'briefcase', title: 'Báo giá dự án 24h', text: 'Giá tốt khi đặt đội xe từ 5 chiếc', href: '#tu-van' },
            { icon: 'card', title: 'Thuê tài chính', text: 'Trả góp, thuê theo tháng cho doanh nghiệp', href: '/mua-tra-gop/' },
            { icon: 'wrench', title: 'Bảo trì tận nơi', text: 'Kỹ thuật viên có mặt tại sân, resort, nhà xưởng', href: '/sua-chua-tan-noi/' },
          ],
        },
        sortOrder: 2,
      },
      {
        sectionKey: 'danh-muc',
        heading: 'Danh mục sản phẩm',
        metadata: {
          _component: 'category-grid',
          layout: 'tiles',
          limit: '12',
        },
        sortOrder: 3,
      },
      {
        sectionKey: 'xe-noi-bat',
        heading: 'Dòng xe chủ lực',
        metadata: {
          _component: 'product-grid',
          layout: 'grid',
          source: 'featured',
          limit: '10',
          ctaLabel: 'Xem tất cả',
          ctaHref: '/san-pham/',
        },
        sortOrder: 4,
      },
      {
        sectionKey: 'xe-dien-san-golf',
        heading: 'Xe điện sân golf',
        metadata: {
          _component: 'product-grid',
          layout: 'split',
          source: 'category',
          categorySlug: 'xe-dien-san-golf',
          limit: '8',
          ctaLabel: 'Xem tất cả xe sân golf',
        },
        sortOrder: 5,
      },
      {
        sectionKey: 'xe-dien-resort',
        heading: 'Xe điện du lịch – resort',
        metadata: {
          _component: 'product-grid',
          layout: 'split',
          source: 'category',
          categorySlug: 'xe-dien-du-lich',
          limit: '8',
          ctaLabel: 'Xem tất cả xe resort',
        },
        sortOrder: 6,
      },
      {
        sectionKey: 'xe-nang-dien',
        heading: 'Xe nâng điện',
        metadata: {
          _component: 'product-grid',
          layout: 'split',
          source: 'category',
          categorySlug: 'xe-nang-dien',
          limit: '8',
          ctaLabel: 'Xem tất cả xe nâng',
        },
        sortOrder: 7,
      },
      {
        sectionKey: 'con-so',
        heading: 'Đội xe đang vận hành cùng khách hàng',
        metadata: {
          _component: 'stats',
          stats: [
            { value: '10+', label: 'Năm kinh nghiệm', note: 'Phân phối xe điện chuyên dụng từ năm 2016', icon: 'star' },
            { value: '1.200+', label: 'Xe đã bàn giao', note: 'Xe golf, xe resort và xe nâng trên toàn quốc', icon: 'truck' },
            { value: '60+', label: 'Sân golf & resort', note: 'Từ Phú Quốc, Nha Trang, Đà Nẵng đến Hạ Long', icon: 'golf' },
            { value: '300+', label: 'Doanh nghiệp dùng xe nâng', note: 'Kho hàng, nhà máy, trung tâm phân phối', icon: 'forklift' },
          ],
        },
        sortOrder: 8,
      },
      {
        sectionKey: 'vi-sao-chon',
        heading: 'Vì sao sân golf, resort và nhà máy chọn Xe Điện Xanh',
        content: '<p>Chúng tôi không chỉ bán xe — chúng tôi chịu trách nhiệm cho cả đội xe của bạn chạy ổn định mỗi ngày.</p>',
        metadata: {
          _component: 'feature-cards',
          items: [
            { icon: 'building', title: 'Chuyên dự án', text: 'Khảo sát địa hình, số khách, ca làm việc để đề xuất đúng số lượng và cấu hình xe.' },
            { icon: 'shield', title: 'Chính hãng, đủ giấy tờ', text: 'Nhập khẩu chính ngạch, hoá đơn VAT, CO/CQ, hồ sơ đăng kiểm và đăng ký biển số khu du lịch.' },
            { icon: 'wrench', title: 'Bảo trì tận nơi', text: 'Kỹ thuật viên đến tận sân golf, resort, nhà xưởng; có xe thay thế khi xe lớn cần sửa.' },
            { icon: 'box', title: 'Phụ tùng sẵn kho', text: 'Kho phụ tùng tại TP.HCM và Hà Nội, giao trong 24 giờ, không để đội xe phải nằm chờ.' },
            { icon: 'card', title: 'Thuê tài chính linh hoạt', text: 'Mua đứt, trả góp hoặc thuê theo tháng — phù hợp ngân sách và kế hoạch đầu tư của doanh nghiệp.' },
            { icon: 'users', title: 'Đào tạo vận hành', text: 'Đào tạo lái xe, sạc pin đúng cách và bảo dưỡng cơ bản cho nhân viên khi bàn giao.' },
          ],
        },
        sortOrder: 9,
      },
      {
        sectionKey: 'quy-trinh',
        heading: 'Triển khai đội xe trong 4 bước',
        metadata: {
          _component: 'steps',
          layout: 'circles',
          items: [
            { title: 'Khảo sát', text: 'Đến tận nơi xem địa hình, quãng đường, số lượt khách hoặc khối lượng hàng mỗi ca.' },
            { title: 'Đề xuất & báo giá', text: 'Gửi phương án số lượng, cấu hình xe, pin và trạm sạc kèm báo giá trong 24 giờ.' },
            { title: 'Bàn giao & đào tạo', text: 'Giao xe tận sân, resort, nhà xưởng; hướng dẫn lái xe, sạc pin và vận hành an toàn.' },
            { title: 'Bảo trì trọn đời', text: 'Bảo dưỡng định kỳ tại chỗ, thay pin, sửa chữa và cung cấp phụ tùng suốt vòng đời xe.' },
          ],
        },
        sortOrder: 10,
      },
      {
        sectionKey: 'cam-ket',
        metadata: {
          _component: 'service-strip',
          items: SERVICE_COMMITMENTS,
        },
        sortOrder: 11,
      },
      {
        sectionKey: 'thuong-hieu',
        heading: 'Thương hiệu phân phối',
        metadata: {
          _component: 'marquee',
          items: ['LVTONG', 'Marshell', 'Eagle', 'Kandi', 'Club Car', 'E-Z-GO', 'Yamaha Golf-Car', 'Heli', 'Hangcha', 'EP Equipment', 'Noblelift', 'Linde', 'Jungheinrich', 'Toyota Material Handling'],
        },
        sortOrder: 12,
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
        sortOrder: 13,
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
        sortOrder: 14,
      },
      {
        sectionKey: 'showroom',
        heading: 'Showroom & kho xe',
        content: '<p>Ghé showroom để xem xe thực tế, chạy thử trên đường nội bộ và gặp kỹ sư tư vấn dự án.</p>',
        metadata: {
          _component: 'store-list',
          layout: 'grid',
          items: SHOWROOMS.slice(0, 3),
          mapLabel: 'Xem bản đồ',
          ctaLabel: 'Xem tất cả showroom',
          ctaHref: '/he-thong-showroom/',
        },
        sortOrder: 15,
      },
      {
        sectionKey: 'tu-van',
        heading: 'Nhận báo giá dự án & tư vấn đội xe',
        content: '<p>Cho chúng tôi biết số lượng, loại xe và địa điểm — kỹ sư sẽ gọi lại trong 15 phút và gửi báo giá trong 24 giờ.</p>',
        metadata: {
          _component: 'quote-form',
          items: CONSULT_BENEFITS,
          defaultType: 'quote',
          formTitle: 'Nhận báo giá miễn phí',
          formSubtitle: 'Gọi lại trong 15 phút (8:00 – 21:00 hằng ngày).',
          submitLabel: 'Gửi yêu cầu báo giá',
          backdropImage: 'uploads/hero/hero-3.webp',
        },
        sortOrder: 16,
      },
    ],
  },
  {
    page: {
      title: 'Tất cả sản phẩm',
      slug: 'products',
      lead: 'Xe điện sân golf, xe điện du lịch – resort, xe nâng điện cùng xe máy điện, xe đạp điện, phụ tùng và trạm sạc chính hãng — báo giá nhanh, giao xe toàn quốc.',
      templateKey: 'products',
      status: PublishStatus.PUBLISHED,
      sortOrder: 2,
      metaTitle: 'Sản phẩm xe điện chính hãng — giá tận xưởng',
      metaDescription:
        'Danh sách xe điện sân golf, xe điện du lịch cho resort, xe nâng điện, xe máy điện, xe đạp điện và phụ tùng chính hãng tại Xe Điện Xanh.',
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
      heroImagePath: 'uploads/pages/showroom.webp',
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
      heroImagePath: 'uploads/pages/about.webp',
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
          '<p>Hôm nay, chúng tôi tập trung vào xe điện sân golf, xe điện du lịch cho resort – khách sạn và xe nâng điện cho nhà xưởng, bên cạnh xe máy điện, xe đạp điện cho gia đình — tất cả đều có bảo hành chính hãng và kỹ thuật viên hỗ trợ tận nơi.</p>',
        metadata: {
          _component: 'icon-card-list',
          layout: 'split',
          image: 'uploads/pages/about.webp',
          imageAlt: 'Cửa hàng xe điện',
          image2: 'uploads/pages/service.webp',
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
            { image: 'uploads/pages/showroom.webp', caption: 'Không gian trưng bày' },
            { image: 'uploads/pages/service.webp', caption: 'Xưởng dịch vụ' },
            { image: 'uploads/pages/delivery.webp', caption: 'Giao xe tận nhà' },
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
      heroImagePath: 'uploads/pages/installment.webp',
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
          image: 'uploads/pages/installment.webp',
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
      heroImagePath: 'uploads/pages/showroom.webp',
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
      heroImagePath: 'uploads/pages/service.webp',
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
      heroImagePath: 'uploads/pages/delivery.webp',
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
      heroImagePath: 'uploads/pages/showroom.webp',
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
      heroImagePath: 'uploads/pages/delivery.webp',
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
      heroImagePath: 'uploads/pages/service.webp',
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
      heroImagePath: 'uploads/pages/about.webp',
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
            { question: 'Cách ứng tuyển', answer: 'Gửi CV qua email lienhe@tramxedien.vn với tiêu đề "Ứng tuyển – Vị trí – Họ tên", hoặc đến trực tiếp showroom gần nhất.' },
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
      heroImagePath: 'uploads/pages/showroom.webp',
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
