/**
 * Seed menu của website: menu chính (header — Trang chủ, 3 dòng chủ đạo Xe sân golf / Xe resort / Xe nâng điện, Sản phẩm khác,
 * Giới thiệu, Tin tức, Liên hệ)
 * và 2 cột link chân trang (footer — Hỗ trợ khách hàng, Về Xe Điện Xanh).
 * Dùng bởi: database/seeding/seeding.service.ts.
 * Lưu ý: chỉ thêm theo (location, href) — mục đã có (kể cả admin đã sửa / ẩn / xoá mềm) giữ nguyên, nên chạy lại db:seed an toàn.
 * Tiêu đề cột footer không phải link thật nên dùng href dạng "#..." riêng cho từng cột để khớp được khi chạy lại.
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  MenuItem,
  type MenuLocation,
} from 'src/modules/admin/menu-items/menu-item.entity';

interface SeedMenuChild {
  label: string;
  href: string;
}

interface SeedMenuItem {
  label: string;
  href: string;
  description?: string;
  showSubmenu?: boolean;
  children?: SeedMenuChild[];
}

const OTHER_PRODUCT_LINKS: SeedMenuChild[] = [
  { label: 'Xe máy điện', href: '/danh-muc/xe-may-dien' },
  { label: 'Xe đạp điện', href: '/danh-muc/xe-dap-dien' },
  { label: 'Xe điện 2 bánh & Scooter', href: '/danh-muc/xe-dien-2-banh' },
  { label: 'Xe điện 3 bánh', href: '/danh-muc/xe-dien-3-banh' },
  { label: 'Xe điện trẻ em', href: '/danh-muc/xe-dien-tre-em' },
  { label: 'Xe chuyên dụng', href: '/danh-muc/xe-chuyen-dung' },
  { label: 'Phụ tùng & pin sạc', href: '/danh-muc/phu-tung' },
  { label: 'Trạm sạc xe điện', href: '/danh-muc/tram-sac' },
];

const MENU_TREE: Record<MenuLocation, SeedMenuItem[]> = {
  header: [
    { label: 'Trang chủ', href: '/', showSubmenu: false },
    { label: 'Xe sân golf', href: '/danh-muc/xe-dien-san-golf', showSubmenu: false },
    { label: 'Xe resort – du lịch', href: '/danh-muc/xe-dien-du-lich', showSubmenu: false },
    {
      label: 'Xe nâng điện',
      href: '/danh-muc/xe-nang-dien',
      children: [
        { label: 'Xe nâng điện ngồi lái', href: '/danh-muc/xe-nang-ngoi-lai' },
        { label: 'Xe nâng đứng lái & reach truck', href: '/danh-muc/xe-nang-dung-lai' },
        { label: 'Xe nâng tay điện', href: '/danh-muc/xe-nang-tay-dien' },
      ],
    },
    {
      label: 'Sản phẩm khác',
      href: '/san-pham',
      children: OTHER_PRODUCT_LINKS,
    },
    { label: 'Giới thiệu', href: '/gioi-thieu', showSubmenu: false },
    {
      label: 'Tin tức',
      href: '/tin-tuc',
      children: [
        { label: 'Tin xe điện', href: '/tin-tuc?category=tin-xe-dien' },
        { label: 'Hướng dẫn', href: '/tin-tuc?category=huong-dan' },
        { label: 'Khuyến mãi', href: '/tin-tuc?category=khuyen-mai' },
        { label: 'Đánh giá xe', href: '/tin-tuc?category=danh-gia-xe' },
      ],
    },
    { label: 'Liên hệ', href: '/lien-he', showSubmenu: false },
  ],
  footer: [
    {
      label: 'Hỗ trợ khách hàng',
      href: '#ho-tro-khach-hang',
      children: [
        { label: 'Hướng dẫn mua hàng', href: '/huong-dan-mua-hang' },
        { label: 'Chính sách bảo hành', href: '/chinh-sach-bao-hanh' },
        { label: 'Chính sách vận chuyển', href: '/chinh-sach-van-chuyen' },
        { label: 'Chính sách đổi trả', href: '/chinh-sach-doi-tra' },
        { label: 'Mua trả góp', href: '/mua-tra-gop' },
        { label: 'Sửa chữa tận nơi', href: '/sua-chua-tan-noi' },
      ],
    },
    {
      label: 'Về Xe Điện Xanh',
      href: '#ve-xe-dien-xanh',
      children: [
        { label: 'Giới thiệu', href: '/gioi-thieu' },
        { label: 'Hệ thống showroom', href: '/he-thong-showroom' },
        { label: 'Tin tức', href: '/tin-tuc' },
        { label: 'Tuyển dụng', href: '/tuyen-dung' },
        { label: 'Chính sách đại lý', href: '/chinh-sach-dai-ly' },
        { label: 'Liên hệ', href: '/lien-he' },
      ],
    },
  ],
};

@Injectable()
export class MenuSeed {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepo: Repository<MenuItem>,
  ) {}

  private async seedLocation(
    location: MenuLocation,
    items: SeedMenuItem[],
  ): Promise<number> {
    let createdCount = 0;
    let rootOrder = 0;

    for (const item of items) {
      rootOrder++;
      let root = await this.menuRepo.findOne({
        where: { href: item.href, parentId: IsNull(), location },
        withDeleted: true,
      });

      if (!root) {
        root = await this.menuRepo.save(
          this.menuRepo.create({
            label: item.label,
            href: item.href,
            description: item.description ?? null,
            parentId: null,
            isActive: true,
            showSubmenu: item.showSubmenu ?? true,
            location,
            sortOrder: rootOrder,
          }),
        );
        createdCount++;
      }

      let childOrder = 0;
      for (const child of item.children ?? []) {
        childOrder++;
        const existing = await this.menuRepo.findOne({
          where: { href: child.href, parentId: root.id },
          withDeleted: true,
        });
        if (existing) continue;

        await this.menuRepo.save(
          this.menuRepo.create({
            label: child.label,
            href: child.href,
            parentId: root.id,
            isActive: true,
            location,
            sortOrder: childOrder,
          }),
        );
        createdCount++;
      }
    }

    return createdCount;
  }

  async run(): Promise<void> {
    let createdCount = 0;
    for (const [location, items] of Object.entries(MENU_TREE)) {
      createdCount += await this.seedLocation(location as MenuLocation, items);
    }

    console.log(
      createdCount > 0
        ? `Menu seed: created ${createdCount} missing item(s).`
        : 'Menu seed: nothing missing, skipping.',
    );
  }
}
