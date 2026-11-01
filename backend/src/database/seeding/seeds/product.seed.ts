/**
 * Seed sản phẩm mẫu (43 sản phẩm: xe đạp điện, xe máy điện, scooter, xe 3 bánh, ô tô điện, xe trẻ em, xe chuyên dụng, phụ tùng, trạm sạc).
 * Dùng bởi: database/seeding/seeding.service.ts (chạy sau product-category.seed.ts — gắn danh mục theo slug).
 * Lưu ý: chỉ thêm theo slug — sản phẩm đã có (kể cả admin đã sửa / xoá mềm) giữ nguyên, chạy lại an toàn. Ảnh là file tĩnh
 * frontend-next/public/images/products/<nhóm>-<số>.webp; gallery mặc định là 2 ảnh kế tiếp trong cùng nhóm (IMAGE_GROUP_SIZES).
 * publishedAt lùi dần theo daysAgo (mặc định xáo theo vị trí) để khối "Sản phẩm mới nhất" có thứ tự tự nhiên.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { slugify } from 'src/common/helpers/slug.helper';
import {
  Product,
  type ProductSpec,
  type ProductStockStatus,
} from 'src/modules/admin/products/entities/product.entity';
import { ProductCategory } from 'src/modules/admin/product-categories/entities/product-category.entity';

const IMAGE_GROUP_SIZES: Record<string, number> = {
  'xe-dap-dien': 4,
  'xe-may-dien': 4,
  'xe-dien-2-banh': 3,
  'xe-dien-3-banh': 3,
  'o-to-dien': 4,
  'xe-dien-tre-em': 3,
  'xe-chuyen-dung': 4,
  'phu-tung': 5,
  'tram-sac': 2,
};

const STANDARD_PROMOTION =
  'Tặng mũ bảo hiểm + khoá chống trộm\nGiảm thêm 500.000đ khi thanh toán chuyển khoản\nTrả góp 0% qua thẻ tín dụng';

const PROMOTION_BY_IMAGE_GROUP: Record<string, string> = {
  'xe-dap-dien': STANDARD_PROMOTION,
  'xe-may-dien': STANDARD_PROMOTION,
  'xe-dien-2-banh':
    'Tặng mũ bảo hiểm + túi đựng scooter\nTrả góp 0% qua thẻ tín dụng',
  'xe-dien-3-banh': STANDARD_PROMOTION,
  'xe-dien-tre-em': 'Tặng bộ đồ chơi mini cho bé\nMiễn phí giao hàng nội thành',
  'phu-tung':
    'Miễn phí lắp đặt tại cửa hàng\nGiao nhanh 2 giờ nội thành TP.HCM và Hà Nội',
  'tram-sac': 'Miễn phí khảo sát và tư vấn lắp đặt\nTặng gói bảo trì 12 tháng',
};

type VehicleSpecInput = {
  motor?: string;
  battery?: string;
  range?: string;
  speed?: string;
  chargeTime?: string;
  load?: string;
  seats?: string;
  weight?: string;
  size?: string;
  brake?: string;
  tire?: string;
  colors?: string;
  age?: string;
};

const VEHICLE_SPEC_LABELS: Array<[keyof VehicleSpecInput, string]> = [
  ['motor', 'Động cơ'],
  ['battery', 'Pin / Ắc quy'],
  ['range', 'Quãng đường / lần sạc'],
  ['speed', 'Tốc độ tối đa'],
  ['chargeTime', 'Thời gian sạc'],
  ['load', 'Tải trọng'],
  ['seats', 'Số chỗ ngồi'],
  ['age', 'Độ tuổi phù hợp'],
  ['weight', 'Trọng lượng xe'],
  ['size', 'Kích thước (D x R x C)'],
  ['brake', 'Phanh'],
  ['tire', 'Lốp'],
  ['colors', 'Màu sắc'],
];

const buildVehicleSpecs = (input: VehicleSpecInput): ProductSpec[] =>
  VEHICLE_SPEC_LABELS.filter(([key]) => input[key]).map(([key, label]) => ({
    label,
    value: input[key] as string,
  }));

const buildSpecPairs = (pairs: Array<[string, string]>): ProductSpec[] =>
  pairs.map(([label, value]) => ({ label, value }));

type SeedProduct = {
  category: string;
  title: string;
  brand: string;
  price: number | null;
  originalPrice?: number;
  isFeatured?: boolean;
  badge?: string;
  stockStatus?: ProductStockStatus;
  imageGroup: string;
  imageNumber: number;
  galleryNumbers?: number[];
  daysAgo?: number;
  excerpt: string;
  story: string;
  highlights: string[];
  specs: ProductSpec[];
  warranty: string;
};

const PRODUCTS: SeedProduct[] = [
  {
    category: 'xe-dap-dien',
    title: 'Xe đạp điện Vnbike i1',
    brand: 'Vnbike',
    price: 9990000,
    originalPrice: 10550000,
    isFeatured: true,
    badge: 'Bán chạy',
    imageGroup: 'xe-dap-dien',
    imageNumber: 1,
    excerpt:
      'Mẫu xe đạp điện gọn nhẹ bán chạy nhất, khung thấp dễ lên xuống, đi học – đi chợ đều tiện.',
    story:
      'Vnbike i1 dùng khung thép sơn tĩnh điện, yên rộng và giỏ trước lớn. Động cơ 250W vận hành êm, đi trong phố đông vẫn nhẹ nhàng; ắc quy 48V cho quãng đường khoảng 50 km, đủ cho cả tuần đi học nếu sạc 2 ngày một lần.',
    highlights: [
      'Khung thấp, yên rộng, phù hợp học sinh và phụ nữ',
      'Động cơ 250W êm, tiết kiệm điện',
      'Đèn LED pha sáng, xi nhan đầy đủ',
      'Có bàn đạp trợ lực khi hết điện',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 250W',
      battery: 'Ắc quy 48V 12Ah',
      range: '45 – 55 km',
      speed: '25 km/h',
      chargeTime: '6 – 8 giờ',
      load: '120 kg',
      weight: '38 kg',
      size: '1.560 x 620 x 1.020 mm',
      brake: 'Phanh đĩa trước, phanh cơ sau',
      tire: '14 x 2.125 inch',
      colors: 'Trắng, Đen, Xanh mint, Hồng',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-dap-dien',
    title: 'Xe đạp điện Vnbike X1 Plus',
    brand: 'Vnbike',
    price: 12990000,
    originalPrice: 13900000,
    isFeatured: true,
    imageGroup: 'xe-dap-dien',
    imageNumber: 2,
    excerpt:
      'Phiên bản nâng cấp với giảm xóc thủy lực, đồng hồ LED và cốp đựng đồ rộng.',
    story:
      'X1 Plus hướng tới học sinh cấp 3 và sinh viên cần chiếc xe bền, đẹp và đi xa hơn. Ắc quy 48V 20Ah cho quãng đường tới 70 km, giảm xóc trước sau dạng thủy lực giúp đi đường xấu vẫn êm.',
    highlights: [
      'Ắc quy 20Ah, đi tới 70 km mỗi lần sạc',
      'Giảm xóc thủy lực trước – sau',
      'Đồng hồ LED hiển thị pin, tốc độ',
      'Cốp sau rộng, để vừa áo mưa và sách vở',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 250W',
      battery: 'Ắc quy 48V 20Ah',
      range: '60 – 70 km',
      speed: '25 km/h',
      chargeTime: '7 – 9 giờ',
      load: '130 kg',
      weight: '48 kg',
      size: '1.650 x 660 x 1.080 mm',
      brake: 'Phanh đĩa trước, phanh cơ sau',
      tire: '16 x 2.5 inch',
      colors: 'Đen nhám, Trắng ngọc, Xanh rêu',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-dap-dien',
    title: 'Xe đạp điện Vnbike Hotgirl G1',
    brand: 'Vnbike',
    price: 9990000,
    imageGroup: 'xe-dap-dien',
    imageNumber: 3,
    excerpt:
      'Thiết kế cổ điển với tông màu pastel, giỏ mây trước xinh xắn, rất được các bạn nữ yêu thích.',
    story:
      'Hotgirl G1 mang phong cách xe đạp châu Âu với khung cong mềm mại, yên da và giỏ trước kiểu mây đan. Xe nhẹ, dễ dắt, phù hợp đi học, đi chơi quanh khu phố.',
    highlights: [
      'Thiết kế cổ điển, màu pastel trẻ trung',
      'Giỏ trước kiểu mây đan, yên da êm',
      'Trọng lượng nhẹ, dễ dắt khi hết điện',
      'Đèn pha LED tròn phong cách retro',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 250W',
      battery: 'Ắc quy 48V 12Ah',
      range: '40 – 50 km',
      speed: '25 km/h',
      chargeTime: '6 – 8 giờ',
      load: '110 kg',
      weight: '36 kg',
      size: '1.580 x 600 x 1.050 mm',
      brake: 'Phanh cơ trước – sau',
      tire: '14 x 2.125 inch',
      colors: 'Kem, Hồng phấn, Xanh ngọc',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-dap-dien',
    title: 'Xe điện YAKA VX',
    brand: 'YAKA',
    price: 10990000,
    originalPrice: 11800000,
    isFeatured: true,
    imageGroup: 'xe-dap-dien',
    imageNumber: 4,
    excerpt:
      'Kiểu dáng thể thao, mặt nạ LED cá tính, động cơ khỏe cho học sinh và người đi làm gần.',
    story:
      'YAKA VX có thân xe dạng tay ga mini, sàn để chân rộng và yên đôi chở được hai người. Bộ điều tốc thông minh giúp xe tăng tốc mượt, tiết kiệm điện và bảo vệ ắc quy.',
    highlights: [
      'Mặt nạ LED cá tính, đèn hậu dạng dải',
      'Sàn để chân phẳng, yên đôi rộng',
      'Bộ điều tốc thông minh, chống giật',
      'Khoá điện chống trộm có remote',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 350W',
      battery: 'Ắc quy 48V 12Ah',
      range: '50 – 60 km',
      speed: '35 km/h',
      chargeTime: '6 – 8 giờ',
      load: '150 kg',
      weight: '52 kg',
      size: '1.620 x 680 x 1.050 mm',
      brake: 'Phanh đĩa trước, phanh cơ sau',
      tire: '14 x 2.5 inch không săm',
      colors: 'Đen, Trắng, Xám xi măng',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-dap-dien',
    title: 'Xe điện V1 Plus Livo',
    brand: 'Livo',
    price: 11800000,
    originalPrice: 12990000,
    isFeatured: true,
    imageGroup: 'xe-dap-dien',
    imageNumber: 1,
    galleryNumbers: [3, 4],
    excerpt:
      'Mẫu xe điện mini đa năng, cốp lớn, đèn LED full, đi học và đi làm đều phù hợp.',
    story:
      'V1 Plus Livo được ưa chuộng nhờ thiết kế gọn gàng nhưng vẫn có cốp đủ rộng cho mũ bảo hiểm nửa đầu. Xe có chế độ đi số lùi hỗ trợ dắt xe trong hẻm nhỏ và bãi giữ xe chật.',
    highlights: [
      'Cốp rộng để vừa mũ bảo hiểm',
      'Có số lùi hỗ trợ dắt xe',
      'Đèn LED toàn bộ, đồng hồ điện tử',
      'Giảm xóc trước dạng ống lồng',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 350W',
      battery: 'Ắc quy 48V 20Ah',
      range: '60 – 70 km',
      speed: '35 km/h',
      chargeTime: '7 – 9 giờ',
      load: '150 kg',
      weight: '58 kg',
      size: '1.640 x 680 x 1.070 mm',
      brake: 'Phanh đĩa trước, phanh cơ sau',
      tire: '14 x 2.5 inch không săm',
      colors: 'Trắng, Đen, Xanh dương',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-dap-dien',
    title: 'Xe đạp điện Pega Cap AZ',
    brand: 'Pega',
    price: 12900000,
    imageGroup: 'xe-dap-dien',
    imageNumber: 2,
    excerpt:
      'Dòng xe đạp điện quốc dân với độ bền cao, phụ tùng dễ thay thế trên toàn quốc.',
    story:
      'Pega Cap AZ giữ kiểu dáng quen thuộc được nhiều gia đình tin dùng, khung chắc chắn và chi phí bảo dưỡng thấp. Hệ thống điện được làm kín chống nước, yên tâm đi mưa mùa hè.',
    highlights: [
      'Khung chắc chắn, bền bỉ nhiều năm',
      'Phụ tùng phổ biến, dễ sửa chữa',
      'Hệ thống điện chống nước',
      'Bàn đạp trợ lực nhẹ',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 250W',
      battery: 'Ắc quy 48V 14Ah',
      range: '50 – 60 km',
      speed: '25 km/h',
      chargeTime: '6 – 8 giờ',
      load: '120 kg',
      weight: '45 kg',
      size: '1.600 x 640 x 1.060 mm',
      brake: 'Phanh cơ trước – sau',
      tire: '16 x 2.125 inch',
      colors: 'Đỏ, Đen, Trắng',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-dap-dien',
    title: 'Xe điện Smart M133',
    brand: 'Smart',
    price: 7500000,
    originalPrice: 8500000,
    isFeatured: true,
    badge: 'Giá tốt',
    imageGroup: 'xe-dap-dien',
    imageNumber: 3,
    excerpt:
      'Lựa chọn tiết kiệm nhất: dáng M133 kinh điển, nhẹ, dễ đi, giá chưa tới 8 triệu.',
    story:
      'Smart M133 có khung nhôm nhẹ, yên đôi và bàn đạp trợ lực — đúng kiểu xe "đi đâu cũng tiện" cho cả học sinh lẫn người lớn tuổi. Chi phí sạc mỗi lần chỉ khoảng 1.500đ.',
    highlights: [
      'Giá mềm, chi phí sử dụng cực thấp',
      'Khung nhôm nhẹ chỉ 35 kg',
      'Yên đôi, chở được 2 người',
      'Gập gọn tay lái khi để trong nhà',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 250W',
      battery: 'Ắc quy 48V 12Ah',
      range: '40 – 50 km',
      speed: '25 km/h',
      chargeTime: '6 – 8 giờ',
      load: '120 kg',
      weight: '35 kg',
      size: '1.500 x 600 x 1.000 mm',
      brake: 'Phanh cơ trước – sau',
      tire: '14 x 2.5 inch',
      colors: 'Đen, Trắng, Đỏ',
    }),
    warranty: 'Bảo hành 18 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-dap-dien',
    title: 'Xe đạp điện Q Motor A11',
    brand: 'Q Motor',
    price: 14500000,
    imageGroup: 'xe-dap-dien',
    imageNumber: 4,
    excerpt:
      'Xe đạp điện cao cấp với pin lithium tháo rời, nhẹ và sạc nhanh hơn ắc quy chì.',
    story:
      'Q Motor A11 dùng pin lithium 48V có thể tháo ra mang lên nhà sạc — rất tiện cho người ở chung cư. Pin nhẹ, tuổi thọ 1.000 chu kỳ sạc, quãng đường tới 65 km.',
    highlights: [
      'Pin lithium tháo rời, mang lên nhà sạc',
      'Tuổi thọ pin ~1.000 chu kỳ',
      'Sạc đầy trong 4 – 5 giờ',
      'Phanh đĩa hai bánh an toàn',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 250W',
      battery: 'Pin lithium 48V 15Ah',
      range: '55 – 65 km',
      speed: '25 km/h',
      chargeTime: '4 – 5 giờ',
      load: '120 kg',
      weight: '32 kg',
      size: '1.580 x 620 x 1.040 mm',
      brake: 'Phanh đĩa trước – sau',
      tire: '16 x 2.125 inch',
      colors: 'Xám titan, Trắng sữa, Xanh navy',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 18 tháng pin lithium',
  },
  {
    category: 'xe-may-dien',
    title: 'Xe máy điện TAILG Vario',
    brand: 'TAILG',
    price: 21990000,
    isFeatured: true,
    badge: 'Mới',
    imageGroup: 'xe-may-dien',
    imageNumber: 1,
    daysAgo: 2,
    excerpt:
      'Tay ga điện cỡ lớn dáng Vario thể thao, động cơ 1.200W, quãng đường tới 90 km.',
    story:
      'TAILG Vario sở hữu thân xe to, sàn để chân rộng và cốp 22 lít — trải nghiệm không khác xe tay ga xăng. Động cơ 1.200W cho khả năng leo dốc tốt, chở hai người thoải mái.',
    highlights: [
      'Động cơ 1.200W, leo dốc khỏe',
      'Cốp 22 lít để vừa mũ cả đầu',
      'Khởi động bằng smartkey',
      'Cổng sạc USB cho điện thoại',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 1.200W',
      battery: 'Ắc quy graphene 72V 23Ah',
      range: '80 – 90 km',
      speed: '50 km/h',
      chargeTime: '7 – 9 giờ',
      load: '180 kg',
      weight: '98 kg',
      size: '1.860 x 700 x 1.120 mm',
      brake: 'Phanh đĩa trước – sau',
      tire: '12 inch không săm',
      colors: 'Đen bóng, Trắng ngọc trai, Xám',
    }),
    warranty: 'Bảo hành 36 tháng động cơ, 18 tháng ắc quy',
  },
  {
    category: 'xe-may-dien',
    title: 'Xe điện VK 946 Pro',
    brand: 'VK',
    price: 13990000,
    isFeatured: true,
    imageGroup: 'xe-may-dien',
    imageNumber: 2,
    excerpt:
      'Dáng Vespa 946 sang trọng, đèn tròn cổ điển, phù hợp đi làm và dạo phố.',
    story:
      'VK 946 Pro lấy cảm hứng từ những chiếc scooter Ý với đường cong mềm mại, đèn pha tròn và yên da hai tông màu. Xe được trang bị phanh đĩa trước và giảm xóc thủy lực.',
    highlights: [
      'Thiết kế phong cách Vespa cổ điển',
      'Yên da hai tông màu cao cấp',
      'Giảm xóc thủy lực, đi êm',
      'Đèn LED tròn, xi nhan đồng bộ',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 800W',
      battery: 'Ắc quy 60V 20Ah',
      range: '60 – 70 km',
      speed: '45 km/h',
      chargeTime: '7 – 8 giờ',
      load: '150 kg',
      weight: '78 kg',
      size: '1.750 x 680 x 1.100 mm',
      brake: 'Phanh đĩa trước, phanh cơ sau',
      tire: '10 inch không săm',
      colors: 'Kem, Xanh ngọc, Đỏ đô, Đen',
    }),
    warranty: 'Bảo hành 30 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-may-dien',
    title: 'Xe điện Dior V3 946 Plus',
    brand: 'Dior',
    price: 13990000,
    originalPrice: 14500000,
    isFeatured: true,
    imageGroup: 'xe-may-dien',
    imageNumber: 3,
    excerpt:
      'Bản Plus nâng cấp ắc quy lớn hơn, cốp rộng, chìa khoá thông minh.',
    story:
      'Dior V3 946 Plus giữ thiết kế được yêu thích của dòng 946 và bổ sung khoá thông minh, ắc quy 60V 23Ah cho quãng đường xa hơn. Màn hình LED hiển thị rõ dưới nắng.',
    highlights: [
      'Ắc quy 60V 23Ah, đi xa hơn bản thường',
      'Khoá thông minh, chống trộm',
      'Màn hình LED nhìn rõ dưới nắng',
      'Cốp sâu để vừa mũ nửa đầu',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 1.000W',
      battery: 'Ắc quy 60V 23Ah',
      range: '65 – 75 km',
      speed: '45 km/h',
      chargeTime: '7 – 9 giờ',
      load: '150 kg',
      weight: '82 kg',
      size: '1.760 x 690 x 1.110 mm',
      brake: 'Phanh đĩa trước, phanh cơ sau',
      tire: '10 inch không săm',
      colors: 'Trắng, Xám, Hồng, Xanh bạc hà',
    }),
    warranty: 'Bảo hành 30 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-may-dien',
    title: 'Xe máy điện Nova Revo 946',
    brand: 'Nova',
    price: 20900000,
    imageGroup: 'xe-may-dien',
    imageNumber: 4,
    excerpt:
      'Phiên bản pin lithium cao cấp của dòng 946, nhẹ hơn, sạc nhanh, bền hơn.',
    story:
      'Nova Revo 946 dùng pin lithium 60V tháo rời — sạc ở nhà hoặc văn phòng đều được. Xe nhẹ hơn bản ắc quy khoảng 20 kg, dắt xe và quay đầu trong hẻm dễ dàng.',
    highlights: [
      'Pin lithium tháo rời, nhẹ và bền',
      'Sạc đầy 4 – 5 giờ',
      'Nhẹ hơn bản ắc quy ~20 kg',
      'Ứng dụng định vị xe qua điện thoại',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 1.200W',
      battery: 'Pin lithium 60V 30Ah',
      range: '80 – 90 km',
      speed: '50 km/h',
      chargeTime: '4 – 5 giờ',
      load: '150 kg',
      weight: '68 kg',
      size: '1.760 x 680 x 1.100 mm',
      brake: 'Phanh đĩa trước – sau',
      tire: '12 inch không săm',
      colors: 'Trắng, Đen, Xanh rêu',
    }),
    warranty: 'Bảo hành 36 tháng động cơ, 24 tháng pin lithium',
  },
  {
    category: 'xe-may-dien',
    title: 'Xe máy điện THCEO Xmen Neo',
    brand: 'THCEO',
    price: 15490000,
    originalPrice: 16490000,
    isFeatured: true,
    badge: 'Trả góp 0%',
    imageGroup: 'xe-may-dien',
    imageNumber: 1,
    galleryNumbers: [2, 4],
    excerpt:
      'Dáng Xmen thể thao huyền thoại, khung chắc, bánh lớn, phù hợp người đi làm hằng ngày.',
    story:
      'Xmen Neo phù hợp người cần chiếc xe mạnh mẽ cho quãng đường đi làm 20–30 km mỗi ngày. Bánh 12 inch giúp xe đầm và ổn định hơn, ắc quy 72V đi được khoảng 80 km.',
    highlights: [
      'Thiết kế Xmen thể thao, mạnh mẽ',
      'Bánh 12 inch đầm, ổn định',
      'Ắc quy 72V đi tới 80 km',
      'Hỗ trợ trả góp 0% lãi suất',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 1.000W',
      battery: 'Ắc quy 72V 20Ah',
      range: '70 – 80 km',
      speed: '50 km/h',
      chargeTime: '7 – 9 giờ',
      load: '160 kg',
      weight: '90 kg',
      size: '1.820 x 700 x 1.100 mm',
      brake: 'Phanh đĩa trước – sau',
      tire: '12 inch không săm',
      colors: 'Đen nhám, Xanh GP, Trắng đỏ',
    }),
    warranty: 'Bảo hành 30 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-may-dien',
    title: 'Xe điện YAKA LAVIA SX',
    brand: 'YAKA',
    price: 16450000,
    imageGroup: 'xe-may-dien',
    imageNumber: 2,
    excerpt:
      'Tay ga điện thanh lịch dành cho phái nữ, sàn thấp, yên thấp dễ chống chân.',
    story:
      'YAKA LAVIA SX có chiều cao yên chỉ 740 mm, phụ nữ dáng nhỏ vẫn chống chân thoải mái. Xe có chế độ tiết kiệm điện ECO và đèn pha tự động bật khi trời tối.',
    highlights: [
      'Yên thấp 740 mm, dễ chống chân',
      'Chế độ ECO tiết kiệm điện',
      'Đèn pha tự động',
      'Móc treo đồ và hộc chứa đồ phía trước',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 1.000W',
      battery: 'Ắc quy graphene 60V 23Ah',
      range: '65 – 75 km',
      speed: '45 km/h',
      chargeTime: '7 – 9 giờ',
      load: '150 kg',
      weight: '85 kg',
      size: '1.780 x 680 x 1.090 mm',
      brake: 'Phanh đĩa trước, phanh cơ sau',
      tire: '10 inch không săm',
      colors: 'Trắng ngọc, Hồng pastel, Xanh mint',
    }),
    warranty: 'Bảo hành 30 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-may-dien',
    title: 'Xe điện TYPE3 Pro Max',
    brand: 'TYPE3',
    price: 15990000,
    imageGroup: 'xe-may-dien',
    imageNumber: 3,
    excerpt:
      'Tay ga điện phong cách tối giản, đèn LED vuông, màn hình màu và khoá NFC.',
    story:
      'TYPE3 Pro Max được thiết kế cho giới trẻ thành thị: đường nét vuông vức, màn hình màu hiển thị đầy đủ thông tin và mở khoá bằng thẻ NFC hoặc điện thoại.',
    highlights: [
      'Mở khoá NFC hoặc điện thoại',
      'Màn hình màu 7 inch',
      'Đèn LED vuông hiện đại',
      'Phanh đĩa kép an toàn',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 1.200W',
      battery: 'Ắc quy 72V 20Ah',
      range: '70 – 80 km',
      speed: '50 km/h',
      chargeTime: '7 – 9 giờ',
      load: '160 kg',
      weight: '88 kg',
      size: '1.800 x 690 x 1.110 mm',
      brake: 'Phanh đĩa trước – sau',
      tire: '12 inch không săm',
      colors: 'Xám xi măng, Đen, Trắng',
    }),
    warranty: 'Bảo hành 30 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-may-dien',
    title: 'Xe máy điện Before All BF26',
    brand: 'Before All',
    price: 25000000,
    imageGroup: 'xe-may-dien',
    imageNumber: 4,
    excerpt:
      'Xe máy điện cao cấp, động cơ trung tâm 2.000W, quãng đường tới 110 km.',
    story:
      'Before All BF26 dùng động cơ đặt giữa truyền động bằng xích, cho lực kéo mạnh và cảm giác lái giống xe số. Pin lithium dung lượng lớn đi được hơn 100 km mỗi lần sạc.',
    highlights: [
      'Động cơ đặt giữa 2.000W mạnh mẽ',
      'Pin lithium đi tới 110 km',
      'Phanh đĩa kép có ABS bánh trước',
      'Đèn full LED, màn hình TFT',
    ],
    specs: buildVehicleSpecs({
      motor: 'Mid-drive 2.000W',
      battery: 'Pin lithium 72V 35Ah',
      range: '100 – 110 km',
      speed: '60 km/h',
      chargeTime: '5 – 6 giờ',
      load: '180 kg',
      weight: '95 kg',
      size: '1.900 x 720 x 1.130 mm',
      brake: 'Phanh đĩa trước (ABS) – sau',
      tire: '14 inch không săm',
      colors: 'Đen, Xám bạc',
    }),
    warranty: 'Bảo hành 36 tháng động cơ, 24 tháng pin lithium',
  },
  {
    category: 'xe-dien-2-banh',
    title: 'Xe scooter điện gấp gọn SEALUP Q28',
    brand: 'SEALUP',
    price: 14990000,
    originalPrice: 15500000,
    isFeatured: true,
    imageGroup: 'xe-dien-2-banh',
    imageNumber: 1,
    excerpt:
      'Scooter điện gấp gọn có yên ngồi, bánh 12 inch, gấp lại cho vào cốp ô tô dễ dàng.',
    story:
      'SEALUP Q28 kết hợp sự tiện lợi của scooter và sự thoải mái của xe điện có yên. Gấp gọn trong 5 giây, cất vừa cốp ô tô hoặc góc văn phòng.',
    highlights: [
      'Gấp gọn trong 5 giây',
      'Có yên ngồi tháo rời',
      'Bánh 12 inch êm, đi phố tốt',
      'Pin lithium sạc nhanh 5 giờ',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 500W',
      battery: 'Pin lithium 48V 15Ah',
      range: '45 – 55 km',
      speed: '35 km/h',
      chargeTime: '5 giờ',
      load: '130 kg',
      weight: '32 kg',
      size: '1.300 x 560 x 1.180 mm (gấp: 1.100 x 560 x 520 mm)',
      brake: 'Phanh đĩa trước – sau',
      tire: '12 inch hơi',
      colors: 'Đen, Trắng',
    }),
    warranty: 'Bảo hành 12 tháng động cơ, 12 tháng pin',
  },
  {
    category: 'xe-dien-2-banh',
    title: 'Scooter điện SEALUP Q7',
    brand: 'SEALUP',
    price: 10500000,
    imageGroup: 'xe-dien-2-banh',
    imageNumber: 2,
    excerpt:
      'Scooter đứng lái nhỏ gọn, khung nhôm, phù hợp đi làm kết hợp tàu điện, xe buýt.',
    story:
      'SEALUP Q7 nặng chưa tới 20 kg, xách lên tàu metro hay thang máy chung cư đều nhẹ nhàng. Màn hình trên tay lái hiển thị tốc độ, pin và 3 chế độ lái.',
    highlights: [
      'Nặng chỉ 19 kg, khung nhôm',
      '3 chế độ tốc độ',
      'Đèn trước – sau, chuông điện',
      'Gấp gọn, xách tay dễ dàng',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 350W',
      battery: 'Pin lithium 36V 10Ah',
      range: '25 – 30 km',
      speed: '25 km/h',
      chargeTime: '4 – 5 giờ',
      load: '100 kg',
      weight: '19 kg',
      size: '1.150 x 480 x 1.200 mm',
      brake: 'Phanh đĩa sau + phanh điện từ',
      tire: '10 inch đặc chống đinh',
      colors: 'Đen, Xám',
    }),
    warranty: 'Bảo hành 12 tháng động cơ, 12 tháng pin',
  },
  {
    category: 'xe-dien-2-banh',
    title: 'Scooter điện Gocycle S8',
    brand: 'Gocycle',
    price: 5400000,
    imageGroup: 'xe-dien-2-banh',
    imageNumber: 3,
    excerpt:
      'Scooter điện giá rẻ cho học sinh và người mới làm quen, gọn nhẹ, dễ điều khiển.',
    story:
      'Gocycle S8 là lựa chọn khởi đầu hợp lý: tốc độ vừa phải, phanh điện từ an toàn, gấp gọn để trong nhà. Phù hợp đi quanh khu đô thị, công viên.',
    highlights: [
      'Giá mềm, dễ làm quen',
      'Tốc độ giới hạn an toàn',
      'Gấp gọn để trong nhà',
      'Bánh đặc không lo thủng',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 250W',
      battery: 'Pin lithium 36V 6Ah',
      range: '18 – 22 km',
      speed: '20 km/h',
      chargeTime: '3 – 4 giờ',
      load: '90 kg',
      weight: '13 kg',
      size: '1.050 x 430 x 1.120 mm',
      brake: 'Phanh điện từ + phanh chân sau',
      tire: '8 inch đặc',
      colors: 'Đen, Trắng, Xanh',
    }),
    warranty: 'Bảo hành 12 tháng',
  },
  {
    category: 'xe-dien-2-banh',
    title: 'Xe cân bằng Smart Mini Robot Pro',
    brand: 'Smart',
    price: 6000000,
    imageGroup: 'xe-dien-2-banh',
    imageNumber: 2,
    galleryNumbers: [1, 3],
    excerpt:
      'Xe điện cân bằng 2 bánh có tay lái gối, tự cân bằng thông minh, loa bluetooth vui nhộn.',
    story:
      'Smart Mini Robot Pro dùng cảm biến con quay hồi chuyển để tự giữ thăng bằng, điều khiển bằng gối nên trẻ lớn và người lớn đều chơi được sau vài phút làm quen.',
    highlights: [
      'Tự cân bằng bằng cảm biến con quay',
      'Tay lái gối, dễ điều khiển',
      'Loa bluetooth và đèn LED nháy',
      'Kết nối ứng dụng chỉnh tốc độ',
    ],
    specs: buildVehicleSpecs({
      motor: '2 x 350W',
      battery: 'Pin lithium 36V 4.4Ah',
      range: '15 – 20 km',
      speed: '16 km/h',
      chargeTime: '2 – 3 giờ',
      load: '100 kg',
      weight: '14 kg',
      size: '580 x 270 x 620 mm',
      tire: '10 inch hơi',
      colors: 'Trắng, Đen',
    }),
    warranty: 'Bảo hành 12 tháng',
  },
  {
    category: 'xe-dien-2-banh',
    title: 'Scooter điện Teverun Blade Mini Ultra',
    brand: 'Teverun',
    price: 29200000,
    stockStatus: 'pre_order',
    imageGroup: 'xe-dien-2-banh',
    imageNumber: 1,
    galleryNumbers: [2, 3],
    excerpt:
      'Scooter hiệu năng cao hai động cơ, giảm xóc kép, dành cho người chơi chuyên nghiệp.',
    story:
      'Teverun Blade Mini Ultra trang bị hai động cơ tổng công suất lớn, giảm xóc trước sau dạng lò xo – thủy lực và phanh dầu. Đây là mẫu scooter dành cho người đã có kinh nghiệm.',
    highlights: [
      'Hai động cơ, tăng tốc mạnh',
      'Giảm xóc kép trước – sau',
      'Phanh dầu hai bánh',
      'Đặt trước, giao trong 7 – 10 ngày',
    ],
    specs: buildVehicleSpecs({
      motor: '2 x 1.000W',
      battery: 'Pin lithium 52V 20Ah',
      range: '60 – 70 km',
      speed: '45 km/h (giới hạn theo quy định khi đi đường phố)',
      chargeTime: '6 – 7 giờ',
      load: '120 kg',
      weight: '33 kg',
      size: '1.200 x 600 x 1.260 mm',
      brake: 'Phanh dầu trước – sau',
      tire: '10 inch không săm',
      colors: 'Đen nhám',
    }),
    warranty: 'Bảo hành 12 tháng động cơ, 12 tháng pin',
  },
  {
    category: 'xe-3-banh-cho-nguoi',
    title: 'Xe điện 3 bánh Santong Winner Pro',
    brand: 'Santong',
    price: 19500000,
    imageGroup: 'xe-dien-3-banh',
    imageNumber: 1,
    excerpt:
      'Xe 3 bánh có mái che, ghế sau rộng, phù hợp người cao tuổi đi chợ, đưa đón cháu.',
    story:
      'Santong Winner Pro có khung thép chắc, mái che nắng mưa và ghế sau chở được thêm một người. Tốc độ vừa phải, phanh tang trống ba bánh giúp người lớn tuổi yên tâm điều khiển.',
    highlights: [
      'Ba bánh vững chãi, không lo đổ xe',
      'Mái che nắng mưa',
      'Ghế sau chở thêm 1 người',
      'Số lùi tiện quay đầu',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 800W',
      battery: 'Ắc quy 60V 32Ah',
      range: '60 – 70 km',
      speed: '30 km/h',
      chargeTime: '8 – 10 giờ',
      load: '250 kg',
      seats: '2 – 3 người',
      weight: '140 kg',
      size: '2.150 x 1.000 x 1.650 mm',
      brake: 'Phanh tang trống 3 bánh',
      colors: 'Đỏ, Xanh, Trắng',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-3-banh-cho-nguoi',
    title: 'Xe điện 3 bánh cho người khuyết tật',
    brand: 'Xe Điện Xanh',
    price: 12500000,
    imageGroup: 'xe-dien-3-banh',
    imageNumber: 2,
    excerpt:
      'Xe 3 bánh sàn thấp, tay ga bên phải, phanh tay — người khuyết tật chân vẫn tự lái được.',
    story:
      'Mẫu xe được thiết kế để người khuyết tật chi dưới có thể tự lên xuống và điều khiển hoàn toàn bằng tay. Ghế xoay 90 độ, sàn thấp và có chỗ gắn xe lăn gấp phía sau.',
    highlights: [
      'Điều khiển hoàn toàn bằng tay',
      'Ghế xoay 90 độ, lên xuống dễ',
      'Giá gắn xe lăn gấp phía sau',
      'Tốc độ giới hạn an toàn',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 500W',
      battery: 'Ắc quy 48V 20Ah',
      range: '40 – 50 km',
      speed: '25 km/h',
      chargeTime: '7 – 8 giờ',
      load: '150 kg',
      seats: '1 người',
      weight: '85 kg',
      size: '1.700 x 820 x 1.150 mm',
      brake: 'Phanh tay cơ + phanh điện',
      colors: 'Xanh dương, Bạc',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-3-banh-cho-hang',
    title: 'Xe ba bánh điện chở hàng thùng 1m6',
    brand: 'Xe Điện Xanh',
    price: null,
    imageGroup: 'xe-dien-3-banh',
    imageNumber: 3,
    excerpt:
      'Xe ba bánh điện thùng lửng 1,6 m, tải 500 kg, chở hàng chợ, giao hàng nội đô tiết kiệm.',
    story:
      'Xe phù hợp tiểu thương, cửa hàng vật liệu, nước giải khát cần chở hàng quãng ngắn mỗi ngày. Chi phí điện chỉ bằng khoảng 1/5 xe xăng cùng tải, không khói, không ồn. Giá thay đổi theo cấu hình thùng và ắc quy.',
    highlights: [
      'Thùng lửng 1,6 m, tải 500 kg',
      'Cầu sau chịu tải, leo dốc tốt',
      'Có số lùi và đèn hậu lớn',
      'Tuỳ chọn thùng kín, thùng ben',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 1.200W',
      battery: 'Ắc quy 60V 45Ah',
      range: '70 – 80 km',
      speed: '35 km/h',
      chargeTime: '8 – 10 giờ',
      load: '500 kg',
      weight: '230 kg',
      size: '2.900 x 1.150 x 1.350 mm (thùng 1.600 x 1.100 mm)',
      brake: 'Phanh tang trống 3 bánh',
      colors: 'Xanh dương, Đỏ',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-dien-san-golf',
    title: 'Xe điện sân golf 4 chỗ',
    brand: 'Xe Điện Xanh',
    price: null,
    imageGroup: 'o-to-dien',
    imageNumber: 1,
    galleryNumbers: [],
    excerpt:
      'Xe điện 4 chỗ cho sân golf, resort, khuôn viên biệt thự — êm, sang trọng, có giá để túi gậy.',
    story:
      'Xe sử dụng động cơ xoay chiều bền bỉ, ghế bọc da chống nước và mái che toàn thân. Phía sau có giá để túi gậy golf hoặc hành lý. Báo giá tuỳ cấu hình ắc quy và phụ kiện.',
    highlights: [
      'Động cơ AC bền bỉ, êm ái',
      'Ghế da chống nước, mái che',
      'Giá để túi gậy / hành lý',
      'Bảo dưỡng định kỳ tận nơi',
    ],
    specs: buildVehicleSpecs({
      motor: 'AC 4kW',
      battery: 'Ắc quy 48V (6 x 8V 150Ah) hoặc pin lithium',
      range: '70 – 90 km',
      speed: '25 km/h',
      chargeTime: '8 – 10 giờ',
      seats: '4 chỗ',
      weight: '520 kg',
      size: '2.900 x 1.220 x 1.900 mm',
      brake: 'Phanh tang trống 4 bánh + phanh tay',
      colors: 'Trắng, Kem, Xanh lá',
    }),
    warranty: 'Bảo hành 24 tháng động cơ và khung',
    isFeatured: true,
  },
  {
    category: 'xe-dien-du-lich',
    title: 'Xe điện du lịch 8 chỗ',
    brand: 'Xe Điện Xanh',
    price: null,
    imageGroup: 'o-to-dien',
    imageNumber: 2,
    galleryNumbers: [3],
    excerpt:
      'Xe điện chở khách 8 chỗ cho khu du lịch, phố đi bộ, resort — vận hành êm, không khí thải.',
    story:
      'Mẫu xe 8 chỗ là lựa chọn phổ biến của các khu du lịch và resort nhờ chi phí vận hành thấp, lên xuống thuận tiện và không gây ồn cho du khách. Có tuỳ chọn rèm che mưa.',
    highlights: [
      '8 chỗ ngồi, 2 hàng ghế quay mặt',
      'Không khói, không ồn',
      'Rèm che mưa tuỳ chọn',
      'Hỗ trợ đăng ký biển số khu du lịch',
    ],
    specs: buildVehicleSpecs({
      motor: 'AC 5kW',
      battery: 'Ắc quy 72V (12 x 6V 200Ah)',
      range: '80 – 100 km',
      speed: '30 km/h',
      chargeTime: '8 – 10 giờ',
      seats: '8 chỗ',
      weight: '880 kg',
      size: '4.200 x 1.500 x 2.000 mm',
      brake: 'Phanh đĩa trước, tang trống sau',
      colors: 'Trắng, Xanh dương, Đỏ',
    }),
    warranty: 'Bảo hành 24 tháng động cơ và khung',
    isFeatured: true,
  },
  {
    category: 'xe-dien-du-lich',
    title: 'Xe điện du lịch 11 chỗ',
    brand: 'Xe Điện Xanh',
    price: null,
    imageGroup: 'o-to-dien',
    imageNumber: 3,
    galleryNumbers: [2],
    excerpt:
      'Xe điện 11 chỗ thân dài cho khu tham quan lớn, sân bay, khu công nghiệp.',
    story:
      'Xe 11 chỗ có 4 hàng ghế, khung thép mạ kẽm chống gỉ và mái composite. Phù hợp các tuyến tham quan dài, đưa đón khách giữa các khu trong resort hoặc khu đô thị.',
    highlights: [
      '11 chỗ ngồi, 4 hàng ghế',
      'Khung mạ kẽm chống gỉ',
      'Mái composite cách nhiệt',
      'Ắc quy dung lượng lớn đi trọn ngày',
    ],
    specs: buildVehicleSpecs({
      motor: 'AC 7,5kW',
      battery: 'Ắc quy 72V (12 x 6V 225Ah)',
      range: '90 – 110 km',
      speed: '30 km/h',
      chargeTime: '9 – 10 giờ',
      seats: '11 chỗ',
      weight: '1.150 kg',
      size: '4.900 x 1.550 x 2.050 mm',
      brake: 'Phanh đĩa thủy lực 4 bánh',
      colors: 'Trắng, Xanh lá',
    }),
    warranty: 'Bảo hành 24 tháng động cơ và khung',
    isFeatured: true,
  },
  {
    category: 'xe-bus-dien',
    title: 'Xe bus điện 14 chỗ',
    brand: 'Xe Điện Xanh',
    price: null,
    stockStatus: 'pre_order',
    imageGroup: 'o-to-dien',
    imageNumber: 4,
    galleryNumbers: [],
    excerpt:
      'Xe bus điện 14 chỗ có cửa kính, điều hoà tuỳ chọn, đưa đón nhân viên và học sinh.',
    story:
      'Xe bus điện 14 chỗ thân kín, cửa trượt hai bên, phù hợp đưa đón trong khu công nghiệp, trường học quốc tế và khu đô thị lớn. Sản xuất theo đơn đặt hàng, tư vấn cấu hình theo tuyến chạy thực tế.',
    highlights: [
      'Thân kín, cửa kính trượt',
      'Tuỳ chọn điều hoà',
      'Sản xuất theo đơn, cấu hình theo tuyến',
      'Đào tạo lái xe và bảo dưỡng',
    ],
    specs: buildVehicleSpecs({
      motor: 'AC 10kW',
      battery: 'Pin lithium 72V 300Ah',
      range: '100 – 120 km',
      speed: '35 km/h',
      chargeTime: '6 – 8 giờ',
      seats: '14 chỗ',
      weight: '1.450 kg',
      size: '5.300 x 1.650 x 2.150 mm',
      brake: 'Phanh đĩa thủy lực 4 bánh',
      colors: 'Trắng, Theo yêu cầu',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 36 tháng pin lithium',
    isFeatured: true,
  },
  {
    category: 'xe-dien-tre-em',
    title: 'Ô tô điện trẻ em 2 động cơ',
    brand: 'Smart',
    price: 3900000,
    originalPrice: 4500000,
    imageGroup: 'xe-dien-tre-em',
    imageNumber: 1,
    excerpt:
      'Ô tô điện cho bé 2–6 tuổi, 2 động cơ, có remote cho bố mẹ điều khiển, nhạc và đèn.',
    story:
      'Xe có hai chế độ: bé tự lái bằng vô lăng và bàn đạp ga, hoặc bố mẹ điều khiển từ xa bằng remote 2.4G. Dây an toàn, cửa mở được và tốc độ thấp giúp bé chơi an toàn.',
    highlights: [
      '2 động cơ, có remote điều khiển',
      'Nhạc, đèn LED, cổng USB',
      'Dây an toàn, cửa mở được',
      'Khởi động êm, chống giật',
    ],
    specs: buildVehicleSpecs({
      motor: '2 x 35W',
      battery: 'Ắc quy 12V 7Ah',
      range: '1 – 1,5 giờ chơi',
      speed: '3 – 5 km/h',
      chargeTime: '8 – 10 giờ',
      load: '30 kg',
      age: '2 – 6 tuổi',
      weight: '16 kg',
      size: '1.150 x 680 x 520 mm',
      colors: 'Đỏ, Trắng, Hồng, Xanh',
    }),
    warranty: 'Bảo hành 6 tháng',
  },
  {
    category: 'xe-dien-tre-em',
    title: 'Xe xích lô điện trẻ em Smart X6',
    brand: 'Smart',
    price: 5500000,
    imageGroup: 'xe-dien-tre-em',
    imageNumber: 2,
    excerpt:
      'Xích lô điện mini độc đáo, bé ngồi lái, phụ huynh ngồi ghế trước — chơi cùng con thật vui.',
    story:
      'Smart X6 lấy cảm hứng từ chiếc xích lô Việt Nam, khung thép sơn tĩnh điện chắc chắn, ghế trước chở được một người lớn. Phù hợp khu vui chơi, homestay và gia đình có sân rộng.',
    highlights: [
      'Thiết kế xích lô độc đáo',
      'Ghế trước chở được người lớn',
      'Khung thép chắc chắn',
      'Phù hợp khu vui chơi, homestay',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 350W',
      battery: 'Ắc quy 48V 12Ah',
      range: '25 – 30 km',
      speed: '12 km/h',
      chargeTime: '6 – 8 giờ',
      load: '120 kg',
      age: '8 tuổi trở lên (có người lớn đi kèm)',
      weight: '45 kg',
      size: '1.600 x 800 x 1.100 mm',
      brake: 'Phanh cơ sau',
      colors: 'Vàng, Xanh, Đỏ',
    }),
    warranty: 'Bảo hành 12 tháng',
  },
  {
    category: 'xe-dien-tre-em',
    title: 'Xe máy điện trẻ em 3 bánh',
    brand: 'Smart',
    price: 1850000,
    imageGroup: 'xe-dien-tre-em',
    imageNumber: 3,
    excerpt:
      'Xe máy điện 3 bánh cho bé 2–5 tuổi, vững chãi, có nhạc và đèn, sạc một lần chơi cả buổi.',
    story:
      'Ba bánh xe giúp bé mới tập lái không bị đổ, tay ga nhẹ và tốc độ thấp. Xe có hộc chứa đồ chơi dưới yên và bánh xe nhựa đặc chống trơn.',
    highlights: [
      'Ba bánh vững, bé không bị ngã',
      'Nhạc và đèn vui nhộn',
      'Hộc chứa đồ dưới yên',
      'Giá vừa túi tiền',
    ],
    specs: buildVehicleSpecs({
      motor: '1 x 25W',
      battery: 'Ắc quy 6V 4.5Ah',
      range: '1 giờ chơi',
      speed: '3 km/h',
      chargeTime: '8 giờ',
      load: '25 kg',
      age: '2 – 5 tuổi',
      weight: '6 kg',
      size: '850 x 450 x 600 mm',
      colors: 'Đỏ, Hồng, Xanh',
    }),
    warranty: 'Bảo hành 6 tháng',
  },
  {
    category: 'xe-cho-rac',
    title: 'Xe điện chở rác 3 bánh 500L',
    brand: 'Xe Điện Xanh',
    price: null,
    imageGroup: 'xe-chuyen-dung',
    imageNumber: 1,
    galleryNumbers: [],
    excerpt:
      'Xe điện 3 bánh thu gom rác thùng 500 lít, ben nâng hạ, phù hợp khu dân cư, chợ, trường học.',
    story:
      'Xe thu gom rác chạy điện giúp các đơn vị vệ sinh môi trường giảm tiếng ồn và khí thải trong khu dân cư. Thùng thép không gỉ có nắp, ben nâng thủy lực đổ rác nhanh.',
    highlights: [
      'Thùng inox 500 lít có nắp',
      'Ben nâng thủy lực đổ rác nhanh',
      'Vận hành êm, không khí thải',
      'Tuỳ chọn thùng 300 – 1.000 lít',
    ],
    specs: buildVehicleSpecs({
      motor: 'BLDC 1.500W',
      battery: 'Ắc quy 60V 52Ah',
      range: '60 – 70 km',
      speed: '25 km/h',
      chargeTime: '8 – 10 giờ',
      load: '500 kg',
      weight: '320 kg',
      size: '2.950 x 1.200 x 1.600 mm',
      brake: 'Phanh tang trống 3 bánh',
      colors: 'Xanh lá, Cam',
    }),
    warranty: 'Bảo hành 24 tháng động cơ, 12 tháng ắc quy',
  },
  {
    category: 'xe-quet-duong',
    title: 'Xe quét đường điện ngồi lái',
    brand: 'Xe Điện Xanh',
    price: null,
    imageGroup: 'xe-chuyen-dung',
    imageNumber: 2,
    galleryNumbers: [],
    excerpt:
      'Xe quét – hút bụi chạy điện ngồi lái, bề rộng quét 1,9 m, cho nhà xưởng, bãi xe, khu đô thị.',
    story:
      'Một xe quét đường thay được 6–8 công nhân quét tay, làm sạch cả bụi mịn nhờ hệ thống hút và lọc. Vận hành êm, phù hợp làm việc ban ngày trong khu dân cư.',
    highlights: [
      'Bề rộng quét 1,9 m',
      'Hút và lọc bụi mịn',
      'Thay được 6 – 8 công nhân',
      'Thùng rác 150 lít, đổ thủy lực',
    ],
    specs: buildVehicleSpecs({
      motor: 'DC 3kW (di chuyển) + 1,5kW (chổi quét)',
      battery: 'Ắc quy 48V 300Ah',
      range: '5 – 6 giờ làm việc',
      speed: '12 km/h',
      chargeTime: '8 – 10 giờ',
      load: 'Thùng rác 150 lít',
      weight: '980 kg',
      size: '2.150 x 1.300 x 1.950 mm',
      brake: 'Phanh thủy lực',
      colors: 'Vàng, Trắng',
    }),
    warranty: 'Bảo hành 12 tháng',
  },
  {
    category: 'xe-nang-dien',
    title: 'Xe nâng điện đứng lái 1.5 tấn',
    brand: 'Xe Điện Xanh',
    price: null,
    badge: 'Mới',
    imageGroup: 'xe-chuyen-dung',
    imageNumber: 3,
    galleryNumbers: [4],
    daysAgo: 1,
    excerpt:
      'Xe nâng điện đứng lái tải 1,5 tấn, nâng cao 3 – 4,5 m, nhỏ gọn cho kho hàng lối đi hẹp.',
    story:
      'Xe nâng đứng lái có bán kính quay nhỏ, chạy tốt trong kho kệ lối đi hẹp. Động cơ AC tiết kiệm điện, pin lithium sạc nhanh giữa ca, không phát thải nên dùng được trong kho thực phẩm, dược phẩm. Báo giá theo chiều cao nâng và loại pin.',
    highlights: [
      'Tải 1,5 tấn, nâng cao tới 4,5 m',
      'Bán kính quay nhỏ, hợp lối đi hẹp',
      'Pin lithium sạc nhanh giữa ca',
      'Hỗ trợ cho thuê, trả góp doanh nghiệp',
    ],
    specs: buildSpecPairs([
      ['Tải trọng nâng', '1.500 kg'],
      ['Chiều cao nâng', '3.000 – 4.500 mm'],
      ['Tâm tải', '500 mm'],
      ['Động cơ di chuyển', 'AC 1,5kW'],
      ['Động cơ nâng', 'DC 2,2kW'],
      ['Pin', 'Lithium 24V 210Ah (tuỳ chọn ắc quy chì)'],
      ['Thời gian làm việc', '6 – 8 giờ / lần sạc'],
      ['Bán kính quay', '1.450 mm'],
      ['Trọng lượng xe', '1.120 kg'],
    ]),
    warranty: 'Bảo hành 12 tháng hoặc 2.000 giờ vận hành',
  },
  {
    category: 'xe-nang-dien',
    title: 'Xe nâng điện ngồi lái 2.5 tấn',
    brand: 'Xe Điện Xanh',
    price: null,
    imageGroup: 'xe-chuyen-dung',
    imageNumber: 4,
    galleryNumbers: [3],
    daysAgo: 3,
    excerpt:
      'Xe nâng điện ngồi lái 4 bánh tải 2,5 tấn, khung nâng 3 tầng, thay thế xe nâng dầu trong nhà xưởng.',
    story:
      'Xe nâng điện ngồi lái 2,5 tấn có sức nâng tương đương xe nâng dầu nhưng không khói, không ồn, chi phí vận hành thấp hơn tới 60%. Ca-bin có ghế giảm chấn, màn hình hiển thị lỗi và giờ làm việc.',
    highlights: [
      'Tải 2,5 tấn, khung nâng 3 tầng',
      'Không khói, chi phí vận hành thấp',
      'Ghế giảm chấn, màn hình báo lỗi',
      'Bảo dưỡng định kỳ tận nhà máy',
    ],
    specs: buildSpecPairs([
      ['Tải trọng nâng', '2.500 kg'],
      ['Chiều cao nâng', '3.000 – 6.000 mm'],
      ['Tâm tải', '500 mm'],
      ['Động cơ di chuyển', 'AC 11kW'],
      ['Động cơ nâng', 'AC 16kW'],
      ['Pin', 'Lithium 80V 280Ah'],
      ['Thời gian làm việc', '7 – 9 giờ / lần sạc'],
      ['Bán kính quay', '2.150 mm'],
      ['Trọng lượng xe', '3.950 kg'],
    ]),
    warranty: 'Bảo hành 12 tháng hoặc 2.000 giờ vận hành',
  },
  {
    category: 'linh-kien',
    title: 'Tay ga 3 chức năng',
    brand: 'Xe Điện Xanh',
    price: 350000,
    imageGroup: 'phu-tung',
    imageNumber: 1,
    galleryNumbers: [],
    excerpt:
      'Tay ga xe điện tích hợp đồng hồ báo pin, công tắc khoá và nút số lùi.',
    story:
      'Tay ga thay thế cho phần lớn xe đạp điện, xe máy điện dùng điện áp 36V – 72V. Vỏ nhựa ABS chịu nắng, dây dẫn bọc chống nước, lắp đặt chỉ khoảng 15 phút.',
    highlights: [
      'Tích hợp báo pin, khoá, số lùi',
      'Tương thích 36V – 72V',
      'Vỏ ABS chịu nắng, chống nước',
      'Miễn phí lắp tại cửa hàng',
    ],
    specs: buildSpecPairs([
      ['Điện áp', '36V – 72V'],
      ['Chức năng', 'Ga, báo pin, khoá điện, số lùi'],
      ['Chất liệu', 'Nhựa ABS, lõi đồng'],
      ['Tương thích', 'Đa số xe đạp điện, xe máy điện phổ thông'],
    ]),
    warranty: 'Bảo hành 6 tháng',
  },
  {
    category: 'linh-kien',
    title: 'Giảm sóc sau xe điện M133',
    brand: 'Xe Điện Xanh',
    price: 700000,
    imageGroup: 'phu-tung',
    imageNumber: 2,
    galleryNumbers: [],
    excerpt:
      'Cặp giảm sóc sau dành cho xe điện dáng M133, lò xo thép chịu tải, đi êm hơn.',
    story:
      'Giảm sóc thay thế đúng kích thước cho xe điện kiểu M133 và các mẫu tương tự. Lò xo thép carbon, ty giảm chấn dầu giúp xe đỡ xóc khi đi đường gồ ghề.',
    highlights: [
      'Đúng kích thước xe kiểu M133',
      'Ty giảm chấn dầu êm ái',
      'Lò xo thép carbon bền',
      'Bán theo cặp',
    ],
    specs: buildSpecPairs([
      ['Chiều dài', '270 mm (tâm lỗ – tâm lỗ)'],
      ['Loại', 'Lò xo + ty dầu'],
      ['Tải trọng khuyến nghị', '≤ 150 kg'],
      ['Quy cách', '1 cặp (2 chiếc)'],
    ]),
    warranty: 'Bảo hành 6 tháng',
  },
  {
    category: 'lop-xe',
    title: 'Lốp xe điện 10x2.50',
    brand: 'Xe Điện Xanh',
    price: 380000,
    imageGroup: 'phu-tung',
    imageNumber: 3,
    galleryNumbers: [],
    excerpt:
      'Lốp không săm 10 x 2.50 inch cho scooter và xe điện bánh nhỏ, gai sâu bám đường.',
    story:
      'Lốp cao su tổng hợp có lớp chống đinh, gai sâu thoát nước tốt khi đi mưa. Phù hợp các dòng scooter điện, xe điện mini và xe máy điện bánh 10 inch.',
    highlights: [
      'Không săm, có lớp chống đinh',
      'Gai sâu, bám đường khi mưa',
      'Cao su bền, ít mòn',
      'Thay nhanh tại cửa hàng',
    ],
    specs: buildSpecPairs([
      ['Kích thước', '10 x 2.50 inch'],
      ['Loại', 'Không săm (tubeless)'],
      ['Áp suất khuyến nghị', '36 – 42 psi'],
      ['Tương thích', 'Scooter điện, xe điện bánh 10 inch'],
    ]),
    warranty: 'Bảo hành 3 tháng lỗi kỹ thuật',
  },
  {
    category: 'sac-xe-dien',
    title: 'Sạc xe điện Smart SP1 60V 5Ah',
    brand: 'Smart',
    price: 650000,
    imageGroup: 'phu-tung',
    imageNumber: 4,
    galleryNumbers: [],
    excerpt:
      'Bộ sạc thông minh 60V tự ngắt khi đầy, có quạt tản nhiệt, đèn báo trạng thái.',
    story:
      'Smart SP1 sạc theo 3 giai đoạn giúp ắc quy bền hơn, tự ngắt khi đầy để tránh phồng bình. Vỏ nhôm tản nhiệt kèm quạt làm mát, dùng an toàn qua đêm.',
    highlights: [
      'Sạc 3 giai đoạn, tự ngắt khi đầy',
      'Vỏ nhôm + quạt tản nhiệt',
      'Đèn báo đang sạc / đã đầy',
      'Bảo vệ quá áp, ngắn mạch',
    ],
    specs: buildSpecPairs([
      ['Điện áp ra', '60V (cho ắc quy 60V 20 – 23Ah)'],
      ['Dòng sạc', '5A'],
      ['Điện áp vào', '220V – 50Hz'],
      ['Bảo vệ', 'Quá áp, quá nhiệt, ngắn mạch, đảo cực'],
    ]),
    warranty: 'Bảo hành 6 tháng',
  },
  {
    category: 'pin-ac-quy',
    title: 'Ắc quy xe đạp điện 48V 12Ah',
    brand: 'Xe Điện Xanh',
    price: 1650000,
    imageGroup: 'phu-tung',
    imageNumber: 5,
    galleryNumbers: [],
    excerpt:
      'Bộ 4 bình ắc quy 12V 12Ah chính hãng cho xe đạp điện 48V, thay tận nhà, thu bình cũ.',
    story:
      'Bộ ắc quy chì – axit kín khí, không cần châm nước, chu kỳ sạc 350 – 400 lần. Khi thay tận nhà, kỹ thuật viên kiểm tra luôn bộ sạc và dây điện để đảm bảo bình mới dùng bền.',
    highlights: [
      'Bộ 4 bình 12V 12Ah',
      'Kín khí, không cần châm nước',
      'Thay tận nhà, thu bình cũ trừ tiền',
      'Kiểm tra sạc và dây điện miễn phí',
    ],
    specs: buildSpecPairs([
      ['Điện áp', '48V (4 x 12V)'],
      ['Dung lượng', '12Ah'],
      ['Loại', 'Chì – axit kín khí (VRLA)'],
      ['Chu kỳ sạc', '350 – 400 lần'],
    ]),
    warranty: 'Bảo hành 12 tháng',
  },
  {
    category: 'pin-ac-quy',
    title: 'Pin Lithium 60V 20Ah',
    brand: 'Xe Điện Xanh',
    price: 5900000,
    imageGroup: 'phu-tung',
    imageNumber: 5,
    galleryNumbers: [4],
    excerpt:
      'Pin lithium thay ắc quy cho xe máy điện 60V: nhẹ hơn 3 lần, bền gấp đôi, sạc nhanh hơn.',
    story:
      'Nâng cấp từ ắc quy chì lên pin lithium giúp xe nhẹ hơn khoảng 15 kg và quãng đường ổn định suốt vòng đời pin. Pin có mạch BMS bảo vệ quá sạc, quá xả và cân bằng cell.',
    highlights: [
      'Nhẹ hơn ắc quy chì ~3 lần',
      'Tuổi thọ 1.000 – 1.500 chu kỳ',
      'Mạch BMS bảo vệ thông minh',
      'Kèm sạc lithium chuyên dụng',
    ],
    specs: buildSpecPairs([
      ['Điện áp', '60V'],
      ['Dung lượng', '20Ah'],
      ['Loại cell', 'Lithium NMC 18650'],
      ['Chu kỳ sạc', '1.000 – 1.500 lần'],
      ['Trọng lượng', '7,5 kg'],
    ]),
    warranty: 'Bảo hành 24 tháng',
  },
  {
    category: 'tram-sac',
    title: 'Trạm sạc xe máy điện 10 cổng',
    brand: 'Xe Điện Xanh',
    price: null,
    imageGroup: 'tram-sac',
    imageNumber: 1,
    galleryNumbers: [2],
    excerpt:
      'Tủ sạc 10 cổng cho chung cư, bãi giữ xe, trường học — có ngắt điện an toàn và thanh toán QR.',
    story:
      'Trạm sạc giúp chung cư và bãi giữ xe giải quyết bài toán sạc xe điện an toàn, tránh cư dân kéo dây sạc tự phát. Mỗi cổng có aptomat riêng, cảm biến nhiệt và ngắt khi sạc đầy; hỗ trợ thanh toán bằng mã QR.',
    highlights: [
      '10 cổng sạc độc lập',
      'Aptomat + cảm biến nhiệt từng cổng',
      'Thanh toán QR, quản lý qua ứng dụng',
      'Khảo sát, lắp đặt trọn gói',
    ],
    specs: buildSpecPairs([
      ['Số cổng', '10 cổng 220V'],
      ['Công suất mỗi cổng', 'Tối đa 1kW'],
      ['Bảo vệ', 'Quá tải, rò điện, quá nhiệt'],
      ['Thanh toán', 'Mã QR / thẻ từ'],
      ['Cấp bảo vệ', 'IP54 (lắp ngoài trời có mái che)'],
    ]),
    warranty: 'Bảo hành 24 tháng',
  },
  {
    category: 'tram-sac',
    title: 'Bộ sạc ô tô điện treo tường 7kW',
    brand: 'Xe Điện Xanh',
    price: 18900000,
    originalPrice: 21500000,
    imageGroup: 'tram-sac',
    imageNumber: 2,
    galleryNumbers: [1],
    excerpt:
      'Wallbox sạc AC 7kW chuẩn Type 2 cho gia đình, sạc đầy ô tô điện qua đêm, có hẹn giờ.',
    story:
      'Bộ sạc treo tường 7kW sạc nhanh gấp 3 lần ổ cắm thông thường, tương thích các dòng ô tô điện phổ biến dùng chuẩn Type 2. Đặt lịch sạc giờ thấp điểm qua ứng dụng để tiết kiệm tiền điện.',
    highlights: [
      'Sạc AC 7kW chuẩn Type 2',
      'Hẹn giờ sạc giờ thấp điểm',
      'Chống nước IP65',
      'Miễn phí khảo sát lắp đặt',
    ],
    specs: buildSpecPairs([
      ['Công suất', '7kW (1 pha 32A)'],
      ['Chuẩn sạc', 'Type 2 (IEC 62196)'],
      ['Chiều dài cáp', '5 m'],
      ['Kết nối', 'Wi-Fi, Bluetooth, ứng dụng di động'],
      ['Cấp bảo vệ', 'IP65'],
    ]),
    warranty: 'Bảo hành 24 tháng',
  },
];

const buildImagePath = (group: string, imageNumber: number) =>
  `/images/products/${group}-${imageNumber}.webp`;

function buildGallery(product: SeedProduct): string[] {
  if (product.galleryNumbers) {
    return product.galleryNumbers.map((imageNumber) =>
      buildImagePath(product.imageGroup, imageNumber),
    );
  }
  const groupSize = IMAGE_GROUP_SIZES[product.imageGroup] ?? 1;
  const nextNumbers = [1, 2]
    .map((offset) => ((product.imageNumber - 1 + offset) % groupSize) + 1)
    .filter((imageNumber) => imageNumber !== product.imageNumber);
  return [...new Set(nextNumbers)].map((imageNumber) =>
    buildImagePath(product.imageGroup, imageNumber),
  );
}

function buildContent(product: SeedProduct): string {
  const highlightItems = product.highlights
    .map((highlight) => `<li>${highlight}</li>`)
    .join('');
  const buyingNote =
    product.price == null
      ? `<p>Giá ${product.title.toLowerCase()} thay đổi theo cấu hình, số lượng và địa điểm giao hàng. Gọi tổng đài hoặc để lại số điện thoại, chuyên viên sẽ gửi báo giá chi tiết và lịch xem xe trong ngày.</p>`
      : '<p>Mua tại Xe Điện Xanh, bạn được kiểm tra xe trước khi nhận, giao xe tận nhà nội thành, hỗ trợ trả góp 0% và bảo hành chính hãng tại toàn bộ hệ thống showroom.</p>';
  return (
    `<h2>Giới thiệu ${product.title}</h2>` +
    `<p>${product.excerpt}</p>` +
    `<p>${product.story}</p>` +
    '<h2>Điểm nổi bật</h2>' +
    `<ul>${highlightItems}</ul>` +
    '<h2>Mua hàng và bảo hành</h2>' +
    buyingNote +
    `<p><strong>${product.warranty}.</strong></p>`
  );
}

@Injectable()
export class ProductSeed {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
  ) {}

  async run(): Promise<void> {
    const categories = await this.categoryRepo.find({ withDeleted: true });
    const categoryIdBySlug = new Map(
      categories.map((category) => [category.slug, category.id]),
    );
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    let createdCount = 0;

    for (const [index, product] of PRODUCTS.entries()) {
      const slug = slugify(product.title);
      const existing = await this.productRepo.findOne({
        where: { slug },
        withDeleted: true,
      });
      if (existing) continue;

      const daysAgo = product.daysAgo ?? ((index * 17) % PRODUCTS.length) + 4;
      await this.productRepo.save(
        this.productRepo.create({
          title: product.title,
          slug,
          status: PublishStatus.PUBLISHED,
          categoryId: categoryIdBySlug.get(product.category) ?? null,
          sku: `XDX-${String(index + 1).padStart(4, '0')}`,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice ?? null,
          badge: product.badge ?? null,
          stockStatus: product.stockStatus ?? 'in_stock',
          isFeatured: product.isFeatured ?? false,
          excerpt: product.excerpt,
          content: buildContent(product),
          thumbnailPath: buildImagePath(product.imageGroup, product.imageNumber),
          gallery: buildGallery(product),
          specs: product.specs,
          highlights: product.highlights,
          promotion:
            product.price == null
              ? null
              : (PROMOTION_BY_IMAGE_GROUP[product.imageGroup] ?? null),
          warranty: product.warranty,
          publishedAt: new Date(now - daysAgo * 24 * hourMs - index * hourMs),
          sortOrder: index + 1,
          metaTitle: `${product.title}${product.price != null ? ' — giá tốt, trả góp 0%' : ' — báo giá mới nhất'}`,
          metaDescription: product.excerpt,
        }),
      );
      createdCount++;
    }

    console.log(
      createdCount > 0
        ? `Product seed: created ${createdCount} product(s).`
        : 'Product seed: nothing missing, skipping.',
    );
  }
}
