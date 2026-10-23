/**
 * Đọc và ghi cấu hình website (bảng site_settings, mỗi key một hàng); chỉ nhận key trong danh sách cho phép.
 * Dùng bởi: settings.controller.ts, client-settings.controller.ts, settings.module.ts.
 * Lưu ý: kiểm tra hết payload rồi mới ghi để không lưu dở; giá trị null = xoá key. brandColors được chèn thẳng
 * vào <style> của site nên chỉ nhận đúng 4 key, mã #RRGGBB. DEFAULT_SETTINGS trả về khi DB chưa có key
 * (không có logo mặc định: site tự hiện biểu tượng SVG + tên thương hiệu). LEGACY_SETTING_KEYS giữ để form settings gửi null xoá dữ liệu cũ.
 */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from './site-setting.entity';

const CURRENT_SETTING_KEYS = [
  'siteTitle',
  'siteDescription',
  'brandName',
  'footerText',
  'faviconUrl',
  'logoUrl',
  'logoHeight',
  'footerLogoUrl',
  'footerLogoHeight',
  'heroImageUrl',
  'ogImageUrl',
  'fontFamily',
  'brandColors',
  'translateEnabled',
  'copyProtection',
  'showPostMeta',
  'translations',
  'socialLinks',
  'contactPage',
  'contactInfo',
];

const LEGACY_SETTING_KEYS = ['colorsDark', 'colorsLight', 'postTitleSize'];

const ALLOWED_KEYS = new Set([...CURRENT_SETTING_KEYS, ...LEGACY_SETTING_KEYS]);

const DEFAULT_SETTINGS: Record<string, unknown> = {
  logoHeight: 42,
  footerLogoHeight: 44,
};

const BRAND_COLOR_KEYS = new Set(['primary', 'secondary', 'black', 'white']);
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function assertValidBrandColors(value: unknown): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('brandColors phải là một object');
  }
  for (const [colorKey, color] of Object.entries(value)) {
    if (!BRAND_COLOR_KEYS.has(colorKey)) {
      throw new BadRequestException(
        `Màu thương hiệu không tồn tại: ${colorKey}`,
      );
    }
    if (typeof color !== 'string' || !HEX_COLOR_PATTERN.test(color)) {
      throw new BadRequestException(
        `Màu thương hiệu "${colorKey}" phải là mã hex dạng #RRGGBB`,
      );
    }
  }
}

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingsRepo: Repository<SiteSetting>,
  ) {}

  async getAll(): Promise<Record<string, unknown>> {
    const rows = await this.settingsRepo.find();
    const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };
    for (const row of rows) settings[row.key] = row.value;
    return settings;
  }

  async updateMany(
    values: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      throw new BadRequestException('Dữ liệu cài đặt phải là một object');
    }

    for (const [key, value] of Object.entries(values)) {
      if (!ALLOWED_KEYS.has(key)) {
        throw new BadRequestException(`Khoá cài đặt không tồn tại: ${key}`);
      }
      if (key === 'brandColors' && value !== null)
        assertValidBrandColors(value);
    }

    for (const [key, value] of Object.entries(values)) {
      if (value === null) {
        await this.settingsRepo.delete({ key });
        continue;
      }

      const existing = await this.settingsRepo.findOne({ where: { key } });
      if (existing) {
        existing.value = value;
        await this.settingsRepo.save(existing);
      } else {
        await this.settingsRepo.save(this.settingsRepo.create({ key, value }));
      }
    }

    return this.getAll();
  }
}
