/**
 * Seed 4 danh mục tin (Tin xe điện, Hướng dẫn, Khuyến mãi, Đánh giá xe) và 8 bài viết mẫu của Xe Điện Xanh.
 * Dùng bởi: database/seeding/seeding.service.ts.
 * Lưu ý: chỉ thêm theo slug, bài / danh mục đã có giữ nguyên, nên chạy lại db:seed an toàn. Slug danh mục khớp link trong menu.seed.ts
 * (/tin-tuc?category=<slug>). Ảnh bìa là file tĩnh /images/news/... của frontend.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublishStatus } from 'src/common/enums/publish-status.enum';
import { BlogCategory } from 'src/modules/admin/blog-categories/entities/blog-category.entity';
import { BlogPost } from 'src/modules/admin/blog-posts/entities/blog-post.entity';

const CATEGORIES = [
  { name: 'Tin xe điện', slug: 'tin-xe-dien', description: 'Tin tức thị trường, công nghệ và xu hướng xe điện', sortOrder: 1 },
  { name: 'Hướng dẫn', slug: 'huong-dan', description: 'Hướng dẫn sử dụng, sạc pin, bảo dưỡng và thủ tục', sortOrder: 2 },
  { name: 'Khuyến mãi', slug: 'khuyen-mai', description: 'Chương trình ưu đãi, quà tặng tại hệ thống', sortOrder: 3 },
  { name: 'Đánh giá xe', slug: 'danh-gia-xe', description: 'Đánh giá chi tiết các mẫu xe điện', sortOrder: 4 },
];

@Injectable()
export class BlogSeed {
  constructor(
    @InjectRepository(BlogCategory)
    private readonly categoryRepo: Repository<BlogCategory>,
    @InjectRepository(BlogPost)
    private readonly postRepo: Repository<BlogPost>,
  ) {}

  async run(): Promise<void> {
    for (const category of CATEGORIES) {
      const existing = await this.categoryRepo.findOneBy({ slug: category.slug });
      if (existing) continue;
      await this.categoryRepo.save(this.categoryRepo.create(category));
    }

    const savedCategories = await this.categoryRepo.find();
    const categoryIdBySlug = new Map(savedCategories.map((item) => [item.slug, item.id]));

    const posts: Partial<BlogPost>[] = [
      {
        title: 'Kinh nghiệm chọn mua xe máy điện cho người mới: 6 tiêu chí quan trọng',
        slug: 'kinh-nghiem-chon-mua-xe-may-dien-cho-nguoi-moi',
        categoryId: categoryIdBySlug.get('huong-dan'),
        excerpt:
          'Quãng đường mỗi ngày, loại pin, công suất động cơ, tải trọng, chiều cao yên và dịch vụ bảo hành — những điều nên cân nhắc trước khi xuống tiền.',
        content:
          '<p>Xe máy điện ngày càng phổ biến nhờ chi phí vận hành thấp và êm ái khi đi trong phố. Tuy nhiên mỗi mẫu xe phù hợp một nhu cầu khác nhau. Dưới đây là 6 tiêu chí giúp bạn chọn đúng ngay từ lần đầu.</p>' +
          '<h2>1. Quãng đường di chuyển mỗi ngày</h2><p>Hãy cộng tổng quãng đường đi – về trong ngày và chọn xe có quãng đường mỗi lần sạc lớn hơn ít nhất 30%. Ví dụ đi 40 km/ngày nên chọn xe 60 km/lần sạc trở lên.</p>' +
          '<h2>2. Pin lithium hay ắc quy chì</h2><p>Pin lithium nhẹ, sạc nhanh, bền hơn nhưng giá cao. Ắc quy chì rẻ, dễ thay thế. Nếu đi nhiều và muốn xe nhẹ, ưu tiên lithium.</p>' +
          '<h2>3. Công suất động cơ</h2><p>Động cơ 1.200–1.500 W đủ cho đi phố; thường xuyên chở hai người hoặc đi dốc nên chọn từ 2.000 W.</p>' +
          '<h2>4. Tải trọng và chiều cao yên</h2><p>Kiểm tra tải trọng tối đa và ngồi thử để chắc chắn chống chân thoải mái.</p>' +
          '<h2>5. Giấy tờ và đăng ký</h2><p>Xe chính hãng phải có hoá đơn, phiếu kiểm định và hồ sơ để đăng ký biển số.</p>' +
          '<h2>6. Dịch vụ sau bán hàng</h2><p>Ưu tiên nơi có xưởng bảo hành gần nhà và hỗ trợ sửa chữa tận nơi — đây là yếu tố quyết định trải nghiệm dài hạn.</p>',
        coverImagePath: '/images/news/news-6.webp',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-10-18T08:00:00Z'),
        sortOrder: 1,
      },
      {
        title: 'Sạc pin xe điện đúng cách để pin bền gấp đôi',
        slug: 'sac-pin-xe-dien-dung-cach',
        categoryId: categoryIdBySlug.get('huong-dan'),
        excerpt:
          'Không để pin cạn kiệt, dùng đúng bộ sạc, tránh sạc ngay khi vừa chạy xong… những thói quen nhỏ giúp kéo dài tuổi thọ pin lithium và ắc quy.',
        content:
          '<p>Pin là bộ phận đắt nhất trên xe điện. Chỉ cần vài thói quen đúng, tuổi thọ pin có thể tăng đáng kể.</p>' +
          '<ul><li><strong>Dùng đúng bộ sạc chính hãng</strong> có điện áp và dòng sạc phù hợp với pin.</li><li><strong>Không để pin cạn kiệt</strong>: nên sạc khi còn 20–30%.</li><li><strong>Đợi pin nguội</strong> 20–30 phút sau khi chạy rồi mới sạc.</li><li><strong>Sạc nơi thoáng mát</strong>, tránh nắng gắt và mưa ẩm.</li><li><strong>Không sạc qua đêm liên tục</strong> nếu bộ sạc không có chức năng tự ngắt.</li></ul>' +
          '<p>Với ắc quy chì, nên sạc đầy ít nhất mỗi tuần một lần kể cả khi ít sử dụng để tránh sunfat hoá bản cực.</p>',
        coverImagePath: '/images/news/news-4.webp',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-10-12T08:00:00Z'),
        sortOrder: 2,
      },
      {
        title: 'Xe đạp điện hay xe máy điện: chọn loại nào cho học sinh?',
        slug: 'xe-dap-dien-hay-xe-may-dien-cho-hoc-sinh',
        categoryId: categoryIdBySlug.get('tin-xe-dien'),
        excerpt:
          'So sánh tốc độ, quy định độ tuổi, giấy tờ và chi phí giữa xe đạp điện và xe máy điện để phụ huynh chọn phương tiện an toàn cho con.',
        content:
          '<p>Học sinh dưới 16 tuổi chỉ nên dùng xe đạp điện có tốc độ thấp. Từ đủ 16 tuổi có thể cân nhắc xe máy điện loại xe gắn máy.</p>' +
          '<table><thead><tr><th></th><th>Xe đạp điện</th><th>Xe máy điện</th></tr></thead><tbody>' +
          '<tr><td>Tốc độ</td><td>Thấp, phù hợp đường gần</td><td>Tối đa khoảng 50 km/h</td></tr>' +
          '<tr><td>Trọng lượng</td><td>Nhẹ, dễ dắt</td><td>Nặng hơn</td></tr>' +
          '<tr><td>Giá tham khảo</td><td>7–15 triệu</td><td>13–30 triệu</td></tr></tbody></table>' +
          '<p>Dù chọn loại nào, hãy trang bị mũ bảo hiểm đạt chuẩn và hướng dẫn con kỹ năng an toàn giao thông.</p>',
        coverImagePath: '/images/news/news-2.webp',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-10-05T08:00:00Z'),
        sortOrder: 3,
      },
      {
        title: 'Ưu đãi tháng 10: tặng mũ bảo hiểm, giảm đến 1 triệu khi mua xe máy điện',
        slug: 'uu-dai-thang-10-tang-mu-bao-hiem',
        categoryId: categoryIdBySlug.get('khuyen-mai'),
        excerpt:
          'Áp dụng tại toàn bộ showroom và khi đặt online: tặng mũ bảo hiểm, khoá chống trộm, giảm thêm khi thanh toán chuyển khoản.',
        content:
          '<p>Trong tháng 10, khách hàng mua xe máy điện và xe đạp điện tại hệ thống nhận ngay:</p>' +
          '<ul><li>Mũ bảo hiểm đạt chuẩn và khoá chống trộm.</li><li>Giảm thêm đến 1.000.000đ khi thanh toán chuyển khoản (tuỳ mẫu).</li><li>Trả góp 0% lãi suất kỳ hạn 6–12 tháng.</li></ul>' +
          '<p>Chương trình áp dụng đến hết tháng hoặc đến khi hết quà tặng. Liên hệ hotline để kiểm tra mẫu xe áp dụng.</p>',
        coverImagePath: '/images/news/news-5.webp',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-10-01T08:00:00Z'),
        sortOrder: 4,
      },
      {
        title: 'Đánh giá xe điện 3 bánh chở hàng: lựa chọn kinh tế cho tiểu thương',
        slug: 'danh-gia-xe-dien-3-banh-cho-hang',
        categoryId: categoryIdBySlug.get('danh-gia-xe'),
        excerpt:
          'Thùng hàng rộng, tải 300–500 kg, chi phí sạc chỉ vài nghìn đồng mỗi ngày — vì sao xe 3 bánh điện được nhiều hộ kinh doanh chọn.',
        content:
          '<p>Với tiểu thương chở hàng trong phố và chợ, xe 3 bánh điện có nhiều lợi thế so với xe xăng: vận hành êm, không khói, chi phí năng lượng thấp và ít hỏng vặt.</p>' +
          '<h2>Ưu điểm</h2><ul><li>Thùng dài 1,4–1,6 m, tải trọng 300–500 kg.</li><li>Chi phí điện cho 60 km chỉ khoảng 5.000–8.000đ.</li><li>Không cần thay nhớt, bảo dưỡng đơn giản.</li></ul>' +
          '<h2>Lưu ý khi chọn</h2><p>Xem kỹ công suất động cơ nếu đường nhiều dốc, chọn loại có phanh tay và đèn chiếu sáng tốt để chạy sớm hoặc tối.</p>',
        coverImagePath: '/images/news/news-8.webp',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-09-24T08:00:00Z'),
        sortOrder: 5,
      },
      {
        title: 'Bảo dưỡng xe điện mùa mưa: 7 điều cần nhớ',
        slug: 'bao-duong-xe-dien-mua-mua',
        categoryId: categoryIdBySlug.get('huong-dan'),
        excerpt:
          'Tránh đi qua chỗ ngập sâu, lau khô cổng sạc, kiểm tra phanh và lốp… giúp xe điện vận hành an toàn suốt mùa mưa.',
        content:
          '<ol><li>Không đi qua đoạn ngập quá trục bánh xe.</li><li>Nếu xe bị ngập, tắt nguồn ngay, không cố khởi động và gọi kỹ thuật.</li><li>Lau khô cổng sạc trước khi cắm sạc.</li><li>Kiểm tra má phanh, độ mòn lốp thường xuyên.</li><li>Che chắn bộ điều khiển (IC) nếu xe để ngoài trời.</li><li>Phun dung dịch chống ẩm cho giắc điện sau khi đi mưa.</li><li>Bảo dưỡng định kỳ 6 tháng / lần tại xưởng chính hãng.</li></ol>',
        coverImagePath: '/images/news/news-3.webp',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-09-15T08:00:00Z'),
        sortOrder: 6,
      },
      {
        title: 'Xe điện sân golf, xe du lịch cho resort: chi phí vận hành thực tế',
        slug: 'xe-dien-san-golf-du-lich-chi-phi-van-hanh',
        categoryId: categoryIdBySlug.get('tin-xe-dien'),
        excerpt:
          'Từ chi phí điện, thay ắc quy đến bảo trì định kỳ — bài toán đầu tư đội xe điện đưa đón khách cho khu nghỉ dưỡng, sân golf.',
        content:
          '<p>Xe điện 4–14 chỗ ngày càng phổ biến tại khu du lịch, sân golf và khu đô thị nhờ vận hành êm, không khí thải và chi phí năng lượng thấp.</p>' +
          '<h2>Các khoản chi phí chính</h2><ul><li>Điện năng: trung bình 8–12 kWh cho mỗi lần sạc đầy.</li><li>Ắc quy / pin: thay sau 3–6 năm tuỳ loại.</li><li>Bảo trì: lốp, phanh, hệ thống treo theo lịch.</li></ul>' +
          '<p>Liên hệ để nhận báo giá dự án kèm gói bảo trì định kỳ tận nơi.</p>',
        coverImagePath: '/images/news/news-1.webp',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-09-05T08:00:00Z'),
        sortOrder: 7,
      },
      {
        title: 'Thủ tục đăng ký biển số xe máy điện cần chuẩn bị gì?',
        slug: 'thu-tuc-dang-ky-bien-so-xe-may-dien',
        categoryId: categoryIdBySlug.get('huong-dan'),
        excerpt:
          'Giấy tờ cần có, nơi nộp hồ sơ và mẹo để việc đăng ký biển số xe máy điện diễn ra nhanh gọn.',
        content:
          '<p>Xe máy điện thuộc diện phải đăng ký biển số trước khi lưu thông. Hồ sơ cơ bản gồm:</p>' +
          '<ul><li>Căn cước công dân của chủ xe.</li><li>Hoá đơn mua xe và phiếu kiểm tra chất lượng xuất xưởng.</li><li>Giấy khai đăng ký xe (khai trực tuyến hoặc tại cơ quan công an).</li><li>Chứng từ nộp lệ phí trước bạ.</li></ul>' +
          '<p>Quy định có thể thay đổi theo từng thời điểm. Khi mua xe tại hệ thống, nhân viên sẽ hướng dẫn và hỗ trợ làm thủ tục trọn gói.</p>',
        coverImagePath: '/images/news/news-7.webp',
        status: PublishStatus.PUBLISHED,
        publishedAt: new Date('2026-08-28T08:00:00Z'),
        sortOrder: 8,
      },
    ];

    let createdCount = 0;
    for (const post of posts) {
      const existing = await this.postRepo.findOneBy({ slug: post.slug });
      if (existing) continue;
      await this.postRepo.save(this.postRepo.create(post));
      createdCount++;
    }

    console.log(
      createdCount > 0
        ? `--- [Seed] Blog: created ${createdCount} post(s).`
        : '--- [Seed] Blog: nothing missing, skipping.',
    );
  }
}
