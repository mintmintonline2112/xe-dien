'use client';

/**
 * Bước 1 của trang Nhập từ website: form cào một danh mục của website nguồn (link, hồ sơ site, giới hạn trang / sản phẩm / ảnh).
 * Dùng bởi: ProductImportScreen.tsx.
 * Lưu ý: bỏ tick "Tải ảnh" thì lượt cào chỉ giữ link ảnh, nhập vào CMS sẽ không có ảnh — chỉ dùng để thử nhanh.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import {
  productImportService,
  type CrawlRequest,
  type ImportJob,
} from '@/app/admin/(protected)/product-import/_lib/product-import.service';

interface CrawlFormProps {
  profiles: string[];
  isBusy: boolean;
  onStarted: (job: ImportJob) => void;
}

const toOptionalNumber = (value: string) => {
  const number = Number(value);
  return value.trim() && Number.isInteger(number) && number > 0 ? number : undefined;
};

export function CrawlForm({ profiles, isBusy, onStarted }: CrawlFormProps) {
  const [url, setUrl] = useState('');
  const [profile, setProfile] = useState(profiles[0] ?? '');
  const [maxPages, setMaxPages] = useState('');
  const [limit, setLimit] = useState('3');
  const [maxImages, setMaxImages] = useState('12');
  const [withImages, setWithImages] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const request: CrawlRequest = {
        url: url.trim(),
        profile,
        maxPages: toOptionalNumber(maxPages),
        limit: toOptionalNumber(limit),
        maxImages: toOptionalNumber(maxImages),
        withImages,
      };
      onStarted(await productImportService.startCrawl(request));
      toast.success('Đã bắt đầu cào');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="gf-card st-section" onSubmit={handleSubmit}>
      <h2 className="st-section-title">1. Cào danh mục nguồn</h2>
      <div>
        <label className="gf-label">Link trang danh mục</label>
        <input
          className="gf-control"
          type="url"
          required
          value={url}
          placeholder="https://site-nguon.vn/o-to-dien/"
          onChange={(e) => setUrl(e.target.value)}
        />
        <p className="gf-hint">Trang liệt kê sản phẩm (trang 1). Công cụ tự lần sang các trang tiếp theo.</p>
      </div>
      <div className="pi-grid">
        <div>
          <label className="gf-label">Hồ sơ site</label>
          <select className="gf-control" value={profile} required onChange={(e) => setProfile(e.target.value)}>
            {profiles.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <p className="gf-hint">Cách đọc giao diện site nguồn. gd3 = giao diện kiểu thegioixechaydien.</p>
        </div>
        <div>
          <label className="gf-label">Giới hạn sản phẩm</label>
          <input className="gf-control" type="number" min={1} value={limit} placeholder="Tất cả" onChange={(e) => setLimit(e.target.value)} />
          <p className="gf-hint">Để trống = lấy hết. Thử lần đầu: 3.</p>
        </div>
        <div>
          <label className="gf-label">Số trang danh sách tối đa</label>
          <input className="gf-control" type="number" min={1} value={maxPages} placeholder="Tất cả" onChange={(e) => setMaxPages(e.target.value)} />
        </div>
        <div>
          <label className="gf-label">Ảnh tối đa mỗi sản phẩm</label>
          <input className="gf-control" type="number" min={1} max={40} value={maxImages} onChange={(e) => setMaxImages(e.target.value)} />
        </div>
      </div>
      <label className="gf-check">
        <input type="checkbox" checked={withImages} onChange={(e) => setWithImages(e.target.checked)} />
        <span>Tải ảnh về (bỏ tick thì nhập vào sẽ không có ảnh — chỉ để thử nhanh)</span>
      </label>
      <div className="pi-actions">
        <button type="submit" className="adm-btn adm-btn--primary" disabled={isBusy || isSubmitting || !profile}>
          {isSubmitting ? <span className="adm-spin" /> : <Download size={16} />}
          Bắt đầu cào
        </button>
        {isBusy && <span className="gf-hint">Đang có việc chạy, chờ xong mới cào tiếp được.</span>}
      </div>
    </form>
  );
}
