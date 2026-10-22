/**
 * Seed cài đặt mặc định của website Xe Điện Xanh (tên thương hiệu, tiêu đề SEO, màu thương hiệu, trang Liên hệ).
 * Dùng bởi: database/seeding/seeding.service.ts.
 * Lưu ý: chỉ thêm key còn thiếu trong bảng site_settings — key admin đã lưu (kể cả đã sửa) giữ nguyên, chạy lại an toàn.
 * Số điện thoại, địa chỉ, email là dữ liệu mẫu để chủ website thay trong Admin → Cài đặt / Trang Liên hệ.
 * Cố ý không seed logoUrl / footerLogoUrl: chưa có logo thì site hiện biểu tượng SVG dựng sẵn + chữ tên thương hiệu.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from 'src/modules/admin/settings/site-setting.entity';

const DEFAULT_SITE_SETTINGS: Record<string, unknown> = {
  brandName: 'Xe Điện Xanh',
  siteTitle: 'Xe Điện Xanh — Xe điện chính hãng, giá tận xưởng, trả góp 0%',
  siteDescription:
    'Hệ thống phân phối xe đạp điện, xe máy điện, xe điện 3 bánh, ô tô điện, xe chuyên dụng và phụ tùng chính hãng. Giao xe tận nhà, bảo hành toàn quốc, trả góp 0%.',
  footerText: 'Xe Điện Xanh. Bảo lưu mọi quyền.',
  brandColors: {
    primary: '#0A7D4F',
    secondary: '#FFB81C',
    black: '#1A2420',
    white: '#FFFFFF',
  },
  contactPage: {
    hero: {
      eyebrow: 'Liên hệ',
      title: 'Liên hệ Xe Điện Xanh',
      lead: 'Đội ngũ tư vấn trực 8:00 – 21:00 mỗi ngày. Gọi tổng đài miễn phí hoặc để lại thông tin, chúng tôi gọi lại trong 15 phút.',
    },
    company: {
      name: 'Công ty TNHH Xe Điện Xanh',
      address: '123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7',
      location: 'TP. Hồ Chí Minh',
      phone: '0900 000 000',
      hotline: '1800 0000',
      email: 'lienhe@xedienxanh.vn',
      hours: '8:00 – 21:00, Thứ 2 – Chủ nhật',
      zalo: '0900000000',
    },
    form: {
      enabled: true,
      kicker: 'Gửi yêu cầu',
      title: 'Để lại thông tin, chúng tôi gọi lại ngay',
      interests: [
        { value: 'Tư vấn chọn xe' },
        { value: 'Báo giá sỉ / đăng ký đại lý' },
        { value: 'Bảo hành – sửa chữa' },
        { value: 'Mua trả góp' },
        { value: 'Góp ý – khiếu nại' },
      ],
      note: 'Thông tin của bạn chỉ dùng để tư vấn, không chia sẻ cho bên thứ ba.',
    },
  },
};

@Injectable()
export class SettingsSeed {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingsRepo: Repository<SiteSetting>,
  ) {}

  async run(): Promise<void> {
    const existingKeys = new Set(
      (await this.settingsRepo.find({ select: ['key'] })).map(
        (setting) => setting.key,
      ),
    );
    const missingSettings = Object.entries(DEFAULT_SITE_SETTINGS).filter(
      ([key]) => !existingKeys.has(key),
    );

    if (missingSettings.length > 0) {
      await this.settingsRepo.save(
        missingSettings.map(([key, value]) =>
          this.settingsRepo.create({ key, value }),
        ),
      );
    }

    console.log(
      missingSettings.length > 0
        ? `Settings seed: added ${missingSettings.length} missing key(s).`
        : 'Settings seed: nothing missing, skipping.',
    );
  }
}
