/**
 * Seed cây danh mục sản phẩm mặc định (11 danh mục gốc + danh mục con) kèm ảnh ô danh mục, icon, mô tả và SEO; 3 dòng chủ đạo đứng đầu:
 * xe điện sân golf, xe điện du lịch – resort, xe nâng điện.
 * Dùng bởi: database/seeding/seeding.service.ts (chạy trước product.seed.ts — sản phẩm gắn danh mục theo slug).
 * Lưu ý: chỉ thêm theo slug — danh mục đã có (kể cả admin đã sửa / ẩn / xoá mềm) giữ nguyên, chạy lại an toàn.
 * imagePath trỏ file tĩnh frontend-next/public/images/categories/<slug>.webp.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from 'src/modules/admin/product-categories/entities/product-category.entity';

type SeedCategory = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  metaDescription: string;
  children?: SeedCategory[];
};

const CATEGORY_TREE: SeedCategory[] = [
  {
    slug: 'xe-dien-san-golf',
    name: 'Xe điện sân golf',
    icon: 'golf',
    description:
      'Xe điện sân golf 2, 4, 6 chỗ và xe chở đồ cho sân golf, biệt thự, khu nghỉ dưỡng — vận hành êm, không khí thải, leo dốc tốt, chi phí vận hành chỉ bằng 1/5 xe xăng.',
    metaDescription:
      'Xe điện sân golf 2 – 6 chỗ, xe golf nâng gầm, xe chở đồ sân golf chính hãng. Báo giá dự án, bảo trì định kỳ tận nơi, giao xe toàn quốc.',
  },
  {
    slug: 'xe-dien-du-lich',
    name: 'Xe điện du lịch – resort',
    icon: 'bus',
    description:
      'Xe điện đưa đón khách 8 – 23 chỗ, xe điện cổ điển, xe tuần tra và xe phục vụ buồng phòng cho resort, khách sạn, khu du lịch và khu đô thị.',
    metaDescription:
      'Xe điện du lịch 8, 11, 14, 23 chỗ, xe điện cổ điển, xe tuần tra, xe buồng phòng cho resort – khách sạn. Giải pháp trọn gói, bảo trì tận nơi.',
    children: [
      {
        slug: 'xe-bus-dien',
        name: 'Xe bus điện',
        icon: 'bus',
        description:
          'Xe bus điện 14 – 23 chỗ đưa đón khách tham quan, nhân viên và học sinh trong resort, khu công nghiệp, khu đô thị.',
        metaDescription:
          'Xe bus điện 14 – 23 chỗ cho resort, khu công nghiệp, trường học, khu đô thị. Tư vấn giải pháp đưa đón trọn gói.',
      },
    ],
  },
  {
    slug: 'xe-nang-dien',
    name: 'Xe nâng điện',
    icon: 'forklift',
    description:
      'Xe nâng điện ngồi lái, đứng lái, reach truck, xe nâng tay điện và xe nâng cao tải 1,2 – 3,5 tấn cho kho hàng, nhà máy, trung tâm phân phối. Bán, cho thuê và bảo trì trọn gói.',
    metaDescription:
      'Xe nâng điện ngồi lái, đứng lái, reach truck, xe nâng tay điện 1,2 – 3,5 tấn chính hãng. Bán, cho thuê, bảo trì, sửa chữa tận nơi.',
    children: [
      {
        slug: 'xe-nang-ngoi-lai',
        name: 'Xe nâng điện ngồi lái',
        icon: 'forklift',
        description: 'Xe nâng đối trọng ngồi lái 3 – 4 bánh tải 1,5 – 3,5 tấn, nâng cao tới 6 m, dùng trong và ngoài nhà xưởng.',
        metaDescription: 'Xe nâng điện ngồi lái 1,5 – 3,5 tấn, 3 bánh và 4 bánh, pin axit chì hoặc lithium, bảo hành chính hãng.',
      },
      {
        slug: 'xe-nang-dung-lai',
        name: 'Xe nâng đứng lái & reach truck',
        icon: 'forklift',
        description: 'Xe nâng đứng lái, reach truck và xe nâng cao cho lối đi hẹp, kệ cao tới 10 m trong kho hàng.',
        metaDescription: 'Reach truck, xe nâng đứng lái, xe nâng cao tải 1,2 – 2 tấn cho kho kệ cao, lối đi hẹp.',
      },
      {
        slug: 'xe-nang-tay-dien',
        name: 'Xe nâng tay điện',
        icon: 'forklift',
        description: 'Xe nâng tay điện (pallet truck) dắt lái hoặc có bệ đứng, tải 1,5 – 3 tấn, gọn nhẹ cho kho và siêu thị.',
        metaDescription: 'Xe nâng tay điện, xe kéo pallet điện 1,5 – 3 tấn, pin lithium, sạc nhanh, giá tốt.',
      },
    ],
  },
  {
    slug: 'xe-chuyen-dung',
    name: 'Xe chuyên dụng',
    icon: 'truck',
    description:
      'Xe điện chuyên dụng cho vệ sinh môi trường trong resort, khu đô thị, nhà xưởng: xe chở rác, xe quét đường.',
    metaDescription:
      'Xe chở rác điện, xe quét đường chạy điện cho resort, khu đô thị, khu công nghiệp, nhà xưởng.',
    children: [
      {
        slug: 'xe-cho-rac',
        name: 'Xe chở rác',
        icon: 'truck',
        description:
          'Xe điện 3–4 bánh thu gom rác cho khu dân cư, khu du lịch, chợ và trường học.',
        metaDescription:
          'Xe điện chở rác 3 bánh, 4 bánh dung tích 300–1.000 lít, vận hành êm, không khí thải.',
      },
      {
        slug: 'xe-quet-duong',
        name: 'Xe quét đường',
        icon: 'truck',
        description:
          'Xe quét đường, xe hút bụi chạy điện cho nhà xưởng, bãi đỗ, khu đô thị.',
        metaDescription:
          'Xe quét đường chạy điện ngồi lái cho nhà xưởng, khu đô thị, bãi đỗ xe — làm sạch nhanh, tiết kiệm nhân công.',
      },
    ],
  },
  {
    slug: 'xe-may-dien',
    name: 'Xe máy điện',
    icon: 'moped',
    description:
      'Xe máy điện thiết kế hiện đại, động cơ mạnh, quãng đường 60–120 km mỗi lần sạc — thay thế xe xăng cho nhu cầu đi lại hằng ngày trong đô thị.',
    metaDescription:
      'Xe máy điện TAILG, YAKA, Dior, Xmen chính hãng: quãng đường xa, pin bền, bảo hành dài, trả góp 0% lãi suất.',
  },
  {
    slug: 'xe-dap-dien',
    name: 'Xe đạp điện',
    icon: 'bike',
    description:
      'Xe đạp điện nhỏ gọn, tiết kiệm, phù hợp học sinh – sinh viên và người đi làm quãng ngắn. Không cần bằng lái, chi phí sạc chỉ vài nghìn đồng mỗi ngày.',
    metaDescription:
      'Xe đạp điện chính hãng Vnbike, YAKA, Pega, Smart giá tốt, bảo hành toàn quốc, giao xe tận nhà, hỗ trợ trả góp 0%.',
  },
  {
    slug: 'xe-dien-2-banh',
    name: 'Xe điện 2 bánh & Scooter',
    icon: 'kick-scooter',
    description:
      'Scooter điện gấp gọn, xe cân bằng và xe điện mini cho người đi phố, đi làm kết hợp tàu xe công cộng hoặc giải trí cuối tuần.',
    metaDescription:
      'Scooter điện gấp gọn SEALUP, Teverun, Gocycle và xe cân bằng thông minh giá tốt, bảo hành chính hãng.',
  },
  {
    slug: 'xe-dien-3-banh',
    name: 'Xe điện 3 bánh',
    icon: 'tricycle',
    description:
      'Xe điện 3 bánh vững chãi cho người cao tuổi, người khuyết tật và nhu cầu chở hàng nhẹ trong phố, chợ, kho xưởng.',
    metaDescription:
      'Xe điện 3 bánh chở người, chở hàng, xe cho người già và người khuyết tật — chắc chắn, an toàn, dễ điều khiển.',
    children: [
      {
        slug: 'xe-3-banh-cho-hang',
        name: 'Xe 3 bánh chở hàng',
        icon: 'truck',
        description:
          'Xe ba bánh điện thùng lửng, thùng kín chở hàng nhẹ cho tiểu thương, cửa hàng và giao hàng nội đô.',
        metaDescription:
          'Xe ba bánh điện chở hàng thùng 1m4 – 1m8, tải 300–500 kg, tiết kiệm chi phí vận chuyển.',
      },
      {
        slug: 'xe-3-banh-cho-nguoi',
        name: 'Xe 3 bánh chở người',
        icon: 'tricycle',
        description:
          'Xe điện 3 bánh có ghế ngồi êm, tốc độ vừa phải, phù hợp người lớn tuổi và người khuyết tật tự di chuyển.',
        metaDescription:
          'Xe điện 3 bánh cho người già, người khuyết tật: thấp sàn, dễ lên xuống, vận hành êm và an toàn.',
      },
    ],
  },
  {
    slug: 'xe-dien-tre-em',
    name: 'Xe điện trẻ em',
    icon: 'kid',
    description:
      'Ô tô điện, xe máy điện và xích lô điện cho bé từ 2–8 tuổi, có điều khiển từ xa cho phụ huynh và vật liệu an toàn.',
    metaDescription:
      'Ô tô điện trẻ em, xe máy điện trẻ em, xích lô điện cho bé — an toàn, có remote điều khiển, giá tốt.',
  },
  {
    slug: 'phu-tung',
    name: 'Phụ tùng & pin sạc',
    icon: 'parts',
    description:
      'Phụ tùng thay thế chính hãng: pin, ắc quy, bộ sạc, lốp, tay ga, giảm sóc… lắp đặt nhanh tại cửa hàng hoặc tận nhà.',
    metaDescription:
      'Phụ tùng xe điện chính hãng: pin lithium, ắc quy, bộ sạc, lốp, tay ga, giảm sóc — giá tốt, giao nhanh.',
    children: [
      {
        slug: 'pin-ac-quy',
        name: 'Pin & ắc quy',
        icon: 'battery',
        description:
          'Ắc quy chì axit và pin lithium cho xe đạp điện, xe máy điện, xe 3 bánh — thay tận nơi, thu cũ đổi mới.',
        metaDescription:
          'Ắc quy xe đạp điện, pin lithium xe máy điện 48V – 72V chính hãng, thay tận nhà, thu cũ đổi mới.',
      },
      {
        slug: 'sac-xe-dien',
        name: 'Bộ sạc xe điện',
        icon: 'charger',
        description:
          'Bộ sạc thông minh tự ngắt khi đầy, đủ điện áp 36V – 72V cho mọi dòng xe điện phổ biến.',
        metaDescription:
          'Bộ sạc xe điện 36V, 48V, 60V, 72V tự ngắt khi đầy, bảo vệ pin, bảo hành 6 tháng.',
      },
      {
        slug: 'lop-xe',
        name: 'Lốp & săm',
        icon: 'tire',
        description:
          'Lốp không săm, lốp đặc và săm xe điện nhiều kích cỡ, bám đường tốt, chống đinh.',
        metaDescription:
          'Lốp xe điện không săm, lốp đặc các cỡ 10 inch – 16 inch, bám đường, chống đinh, giá tốt.',
      },
      {
        slug: 'linh-kien',
        name: 'Linh kiện khác',
        icon: 'parts',
        description:
          'Tay ga, giảm sóc, phanh, đèn, còi, IC điều tốc và các linh kiện thay thế khác.',
        metaDescription:
          'Linh kiện xe điện: tay ga, giảm sóc, phanh đĩa, đèn LED, IC điều tốc — chính hãng, lắp đặt nhanh.',
      },
    ],
  },
  {
    slug: 'tram-sac',
    name: 'Trạm sạc xe điện',
    icon: 'charger',
    description:
      'Trạm sạc xe máy điện nhiều cổng và bộ sạc ô tô điện treo tường cho gia đình, chung cư, bãi giữ xe, doanh nghiệp.',
    metaDescription:
      'Trạm sạc xe máy điện, bộ sạc ô tô điện AC 7kW – 22kW: tư vấn, lắp đặt, bảo trì trọn gói.',
  },
];

@Injectable()
export class ProductCategorySeed {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
  ) {}

  private async insertIfMissing(
    category: SeedCategory,
    parentId: number | null,
    sortOrder: number,
  ): Promise<{ id: number; isCreated: boolean }> {
    const existing = await this.categoryRepo.findOne({
      where: { slug: category.slug },
      withDeleted: true,
    });
    if (existing) return { id: existing.id, isCreated: false };

    const created = await this.categoryRepo.save(
      this.categoryRepo.create({
        name: category.name,
        slug: category.slug,
        parentId,
        description: category.description,
        imagePath: parentId == null ? `/images/categories/${category.slug}.webp` : null,
        icon: category.icon,
        isActive: true,
        sortOrder,
        metaTitle: `${category.name} chính hãng, giá tốt`,
        metaDescription: category.metaDescription,
      }),
    );
    return { id: created.id, isCreated: true };
  }

  async run(): Promise<void> {
    let createdCount = 0;
    let rootOrder = 0;

    for (const root of CATEGORY_TREE) {
      rootOrder++;
      const rootResult = await this.insertIfMissing(root, null, rootOrder);
      if (rootResult.isCreated) createdCount++;

      let childOrder = 0;
      for (const child of root.children ?? []) {
        childOrder++;
        const childResult = await this.insertIfMissing(
          child,
          rootResult.id,
          childOrder,
        );
        if (childResult.isCreated) createdCount++;
      }
    }

    console.log(
      createdCount > 0
        ? `Product category seed: created ${createdCount} category(ies).`
        : 'Product category seed: nothing missing, skipping.',
    );
  }
}
