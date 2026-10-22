'use client';

/**
 * Màn hình Admin → Trang Liên hệ: gom mọi nội dung khách tự chỉnh của trang Liên hệ (tiêu đề, mạng xã hội, cửa hàng, kênh liên hệ nhanh, form) về một chỗ.
 * Dùng bởi: contact-page/page.tsx.
 * Lưu ý: lưu vào site_settings key `contactPage` (1 JSON, kiểu ở _lib/contact-page-config.ts), website đọc qua getSiteSettings().contactPage;
 * trường trống thì website dùng mặc định (src/config/contact.ts). Thứ tự khối trùng thứ tự hiển thị ngoài trang. Lưu kèm socialLinks = contactPage.social.
 */

import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/app/admin/_lib/api-error';
import { settingsService, SETTINGS_QUERY_KEY } from '@/app/admin/(protected)/settings/_lib/settings.service';
import {
  CONTACT_SOCIAL_FIELDS,
  toStoredInterests,
  type ContactSocialKey,
  type StoredContactInterest,
  type StoredContactPage,
} from '@/app/admin/(protected)/contact-page/_lib/contact-page-config';
import { SITE_CONTACT } from '@/config/contact';
import { siteRoutes } from '@/config/routes';
import { DEFAULT_INTERESTS } from '@/settings/contact-page';

type Hero = { eyebrow: string; title: string; lead: string; enEyebrow: string; enTitle: string; enLead: string };
type Social = Record<ContactSocialKey, string>;
type Company = {
  name: string; location: string; address: string; phone: string; hotline: string; zalo: string; messenger: string;
  email: string; hours: string; mapUrl: string; enName: string; enLocation: string; enAddress: string; enHours: string;
};
type FormConfig = { enabled: boolean; kicker: string; title: string; note: string; enKicker: string; enTitle: string; enNote: string };
type Interest = { value: string; en: string };

const EMPTY_HERO: Hero = { eyebrow: '', title: '', lead: '', enEyebrow: '', enTitle: '', enLead: '' };
const EMPTY_SOCIAL: Social = { facebook: '', zalo: '', youtube: '', tiktok: '', instagram: '' };
const EMPTY_COMPANY: Company = {
  name: '', location: '', address: '', phone: '', hotline: '', zalo: '', messenger: '', email: '', hours: '', mapUrl: '',
  enName: '', enLocation: '', enAddress: '', enHours: '',
};
const EMPTY_FORM: FormConfig = { enabled: true, kicker: '', title: '', note: '', enKicker: '', enTitle: '', enNote: '' };

const toText = (value: unknown) => (typeof value === 'string' ? value : '');
const dropEmptyFields = <T extends Record<string, unknown>>(source: T): Partial<T> | undefined => {
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === 'string') { if (value.trim()) kept[key] = value.trim(); }
    else if (value !== undefined && value !== null && !(typeof value === 'object' && !Object.keys(value as object).length)) kept[key] = value;
  }
  return Object.keys(kept).length ? (kept as Partial<T>) : undefined;
};
const removeUndefinedKeys = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export function ContactPageScreen() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [hero, setHero] = useState<Hero>(EMPTY_HERO);
  const [social, setSocial] = useState<Social>(EMPTY_SOCIAL);
  const [company, setCompany] = useState<Company>(EMPTY_COMPANY);
  const [form, setForm] = useState<FormConfig>(EMPTY_FORM);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [newInterest, setNewInterest] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [...SETTINGS_QUERY_KEY],
    queryFn: () => settingsService.get(),
  });

  useEffect(() => {
    if (!data) return;
    const config: StoredContactPage = data.contactPage ?? {};
    setHero({
      eyebrow: toText(config.hero?.eyebrow), title: toText(config.hero?.title), lead: toText(config.hero?.lead),
      enEyebrow: toText(config.hero?.en?.eyebrow), enTitle: toText(config.hero?.en?.title), enLead: toText(config.hero?.en?.lead),
    });
    const savedSocial: Partial<Record<ContactSocialKey, string>> = config.social ?? data.socialLinks ?? {};
    setSocial({
      facebook: toText(savedSocial.facebook), zalo: toText(savedSocial.zalo), youtube: toText(savedSocial.youtube),
      tiktok: toText(savedSocial.tiktok), instagram: toText(savedSocial.instagram),
    });
    const savedCompany = config.company ?? {};
    setCompany({
      name: toText(savedCompany.name), location: toText(savedCompany.location), address: toText(savedCompany.address),
      phone: toText(savedCompany.phone), hotline: toText(savedCompany.hotline), zalo: toText(savedCompany.zalo),
      messenger: toText(savedCompany.messenger), email: toText(savedCompany.email), hours: toText(savedCompany.hours),
      mapUrl: toText(savedCompany.mapUrl),
      enName: toText(savedCompany.en?.name), enLocation: toText(savedCompany.en?.location),
      enAddress: toText(savedCompany.en?.address), enHours: toText(savedCompany.en?.hours),
    });
    setForm({
      enabled: config.form?.enabled !== false,
      kicker: toText(config.form?.kicker), title: toText(config.form?.title), note: toText(config.form?.note),
      enKicker: toText(config.form?.en?.kicker), enTitle: toText(config.form?.en?.title), enNote: toText(config.form?.en?.note),
    });
    const savedInterests: StoredContactInterest[] = config.form?.interests?.length
      ? config.form.interests
      : toStoredInterests(DEFAULT_INTERESTS);
    setInterests(savedInterests.map((interest) => ({ value: toText(interest.value), en: toText(interest.en) })));
  }, [data]);

  function moveInterest(index: number, direction: -1 | 1) {
    setInterests((currentInterests) => {
      const next = [...currentInterests];
      const target = index + direction;
      if (target < 0 || target >= next.length) return currentInterests;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function addInterest() {
    const value = newInterest.trim();
    if (!value) return;
    if (interests.some((interest) => interest.value.toLowerCase() === value.toLowerCase())) {
      toast.error('Nhu cầu này đã có trong danh sách');
      return;
    }
    setInterests((currentInterests) => [...currentInterests, { value, en: '' }]);
    setNewInterest('');
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const contactPage: StoredContactPage = {
        hero: dropEmptyFields({
          eyebrow: hero.eyebrow, title: hero.title, lead: hero.lead,
          en: dropEmptyFields({ eyebrow: hero.enEyebrow, title: hero.enTitle, lead: hero.enLead }),
        }),
        social: dropEmptyFields({ ...social }),
        company: dropEmptyFields({
          name: company.name, location: company.location, address: company.address,
          phone: company.phone, hotline: company.hotline, zalo: company.zalo, messenger: company.messenger,
          email: company.email, hours: company.hours, mapUrl: company.mapUrl,
          en: dropEmptyFields({ name: company.enName, location: company.enLocation, address: company.enAddress, hours: company.enHours }),
        }),
        form: dropEmptyFields({
          enabled: form.enabled,
          kicker: form.kicker, title: form.title, note: form.note,
          interests: interests
            .map((interest) => ({ value: interest.value.trim(), ...(interest.en.trim() ? { en: interest.en.trim() } : {}) }))
            .filter((interest) => interest.value),
          en: dropEmptyFields({ kicker: form.enKicker, title: form.enTitle, note: form.enNote }),
        }),
      };
      const payload = removeUndefinedKeys({ contactPage, socialLinks: contactPage.social ?? null });
      await settingsService.update(payload);
      await queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
      toast.success('Đã lưu — trang Liên hệ cập nhật ngay');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p className="dt-empty">Đang tải cấu hình…</p>;

  const renderTextField = (
    label: string, value: string, onChange: (nextValue: string) => void,
    options: { placeholder?: string; hint?: string; rows?: number; type?: string } = {},
  ) => (
    <div>
      <label className="gf-label">{label}</label>
      {options.rows ? (
        <textarea className="gf-control" rows={options.rows} value={value} placeholder={options.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="gf-control" type={options.type ?? 'text'} value={value} placeholder={options.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {options.hint && <p className="gf-hint">{options.hint}</p>}
    </div>
  );

  return (
    <div className="st-screen">
      <div className="adm-page-header is-row">
        <div>
          <h1 className="adm-page-title">Trang Liên hệ</h1>
          <p className="adm-page-subtitle">
            Tiêu đề, mạng xã hội, thông tin cửa hàng, kênh liên hệ nhanh và form tư vấn hiển thị trên website
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a className="adm-btn" href={siteRoutes.contact} target="_blank" rel="noopener noreferrer">
            Xem trang ↗
          </a>
          <button type="button" className="adm-btn adm-btn--primary" onClick={handleSave} disabled={isSaving}>
            {isSaving && <span className="adm-spin" />}
            Lưu thay đổi
          </button>
        </div>
      </div>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Tiêu đề trang</h2>
        {renderTextField('Dòng nhỏ phía trên (eyebrow)', hero.eyebrow, (value) => setHero({ ...hero, eyebrow: value }), { placeholder: 'Liên hệ' })}
        {renderTextField('Tiêu đề', hero.title, (value) => setHero({ ...hero, title: value }), { placeholder: 'Liên hệ Xe Điện Xanh' })}
        {renderTextField('Đoạn dẫn', hero.lead, (value) => setHero({ ...hero, lead: value }), {
          rows: 2, placeholder: 'Gọi hotline hoặc để lại số điện thoại, nhân viên tư vấn sẽ gọi lại trong 15 phút.',
          hint: 'Để trống thì dùng nội dung mặc định.',
        })}
        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Anh (tuỳ chọn)</strong><small>Để trống thì phiên bản tiếng Anh dùng nội dung tiếng Việt.</small></summary>
          <div className="gf-group-body">
            {renderTextField('Eyebrow (Tiếng Anh)', hero.enEyebrow, (value) => setHero({ ...hero, enEyebrow: value }), { placeholder: 'Contact' })}
            {renderTextField('Tiêu đề (Tiếng Anh)', hero.enTitle, (value) => setHero({ ...hero, enTitle: value }), { placeholder: 'Contact us' })}
            {renderTextField('Đoạn dẫn (Tiếng Anh)', hero.enLead, (value) => setHero({ ...hero, enLead: value }), { rows: 2 })}
          </div>
        </details>
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Thông tin cửa hàng</h2>
        <p className="gf-hint" style={{ marginTop: -6 }}>
          Hiện ở trang Liên hệ, chân trang, thanh trên cùng và thanh liên hệ nhanh trên điện thoại. Để trống ô nào
          thì website dùng giá trị mặc định trong code (chữ mờ trong ô).
        </p>
        {renderTextField('Tên cửa hàng / công ty', company.name, (value) => setCompany({ ...company, name: value }), { placeholder: SITE_CONTACT.name })}
        {renderTextField('Địa chỉ', company.address, (value) => setCompany({ ...company, address: value }), { rows: 2, placeholder: SITE_CONTACT.address })}
        <div className="st-media-row">
          <div style={{ flex: 1 }}>{renderTextField('Tỉnh / thành phố', company.location, (value) => setCompany({ ...company, location: value }), { placeholder: SITE_CONTACT.location })}</div>
          <div style={{ flex: 1 }}>{renderTextField('Giờ mở cửa', company.hours, (value) => setCompany({ ...company, hours: value }), { placeholder: SITE_CONTACT.hours })}</div>
        </div>
        <div className="st-media-row">
          <div style={{ flex: 1 }}>{renderTextField('Hotline mua hàng', company.phone, (value) => setCompany({ ...company, phone: value }), { placeholder: SITE_CONTACT.phone, type: 'tel' })}</div>
          <div style={{ flex: 1 }}>{renderTextField('Tổng đài miễn phí', company.hotline, (value) => setCompany({ ...company, hotline: value }), { placeholder: SITE_CONTACT.hotline, type: 'tel' })}</div>
        </div>
        <div className="st-media-row">
          <div style={{ flex: 1 }}>{renderTextField('Zalo (số điện thoại)', company.zalo, (value) => setCompany({ ...company, zalo: value }), { placeholder: SITE_CONTACT.zalo, type: 'tel', hint: 'Nút Zalo mở chat với số này.' })}</div>
          <div style={{ flex: 1 }}>{renderTextField('Link Messenger', company.messenger, (value) => setCompany({ ...company, messenger: value }), { placeholder: 'https://m.me/ten-trang', type: 'url', hint: 'Để trống thì ẩn nút Messenger.' })}</div>
        </div>
        <div className="st-media-row">
          <div style={{ flex: 1 }}>{renderTextField('Email', company.email, (value) => setCompany({ ...company, email: value }), { placeholder: SITE_CONTACT.email, type: 'email' })}</div>
          <div style={{ flex: 1 }}>{renderTextField('Link Google Maps (tùy chọn)', company.mapUrl, (value) => setCompany({ ...company, mapUrl: value }), { placeholder: 'https://maps.app.goo.gl/...', type: 'url' })}</div>
        </div>
        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Anh (tuỳ chọn)</strong><small>Số điện thoại / email dùng chung, chỉ dịch tên, địa chỉ, giờ mở cửa.</small></summary>
          <div className="gf-group-body">
            {renderTextField('Tên cửa hàng (Tiếng Anh)', company.enName, (value) => setCompany({ ...company, enName: value }))}
            {renderTextField('Tỉnh / thành phố (Tiếng Anh)', company.enLocation, (value) => setCompany({ ...company, enLocation: value }))}
            {renderTextField('Địa chỉ (Tiếng Anh)', company.enAddress, (value) => setCompany({ ...company, enAddress: value }), { rows: 2 })}
            {renderTextField('Giờ mở cửa (Tiếng Anh)', company.enHours, (value) => setCompany({ ...company, enHours: value }))}
          </div>
        </details>
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Mạng xã hội</h2>
        <p className="gf-hint" style={{ marginTop: -6 }}>
          Biểu tượng ở thanh trên cùng, chân trang và trang Liên hệ. Để trống mạng nào thì ẩn mạng đó.
        </p>
        {CONTACT_SOCIAL_FIELDS.map(([key, label, placeholder]) => (
          <div key={key}>
            {renderTextField(label, social[key], (value) => setSocial({ ...social, [key]: value }), { placeholder, type: 'url' })}
          </div>
        ))}
      </section>

      <section className="gf-card st-section">
        <h2 className="st-section-title">Form tư vấn</h2>
        <label className="gf-check st-feature">
          <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} />
          <span>
            <strong>Hiện form gửi yêu cầu</strong>
            <small>Yêu cầu gửi về mục Khách hàng → Yêu cầu tư vấn & liên hệ và chuông thông báo. Tắt thì trang chỉ còn thông tin + mạng xã hội.</small>
          </span>
        </label>
        {renderTextField('Dòng nhỏ phía trên', form.kicker, (value) => setForm({ ...form, kicker: value }), { placeholder: 'Tư vấn miễn phí' })}
        {renderTextField('Tiêu đề khối', form.title, (value) => setForm({ ...form, title: value }), { placeholder: 'Để lại thông tin, chúng tôi gọi lại ngay' })}
        {renderTextField('Ghi chú dưới nút gửi', form.note, (value) => setForm({ ...form, note: value }), {
          rows: 2, placeholder: 'Thông tin của bạn chỉ dùng để liên hệ tư vấn, không chia sẻ cho bên thứ ba.',
        })}

        <div>
          <label className="gf-label">Danh sách &ldquo;Nhu cầu quan tâm&rdquo;</label>
          <p className="gf-hint" style={{ marginTop: 0 }}>
            Các lựa chọn trong ô chọn nhu cầu của form. Cột tiếng Anh là nhãn ở phiên bản tiếng Anh (để trống thì dùng tiếng Việt).
          </p>
          <div className="cp-interests">
            {interests.map((item, index) => (
              <div className="cp-interest-row" key={`${item.value}-${index}`}>
                <input
                  className="gf-control"
                  value={item.value}
                  onChange={(e) => setInterests((currentInterests) => currentInterests.map((interest, i) => (i === index ? { ...interest, value: e.target.value } : interest)))}
                  placeholder="Tên nhu cầu (tiếng Việt)"
                />
                <input
                  className="gf-control"
                  value={item.en}
                  onChange={(e) => setInterests((currentInterests) => currentInterests.map((interest, i) => (i === index ? { ...interest, en: e.target.value } : interest)))}
                  placeholder="English"
                />
                <div className="cp-interest-actions">
                  <button type="button" className="adm-icon-btn" title="Lên" disabled={index === 0} onClick={() => moveInterest(index, -1)}><ArrowUp size={15} /></button>
                  <button type="button" className="adm-icon-btn" title="Xuống" disabled={index === interests.length - 1} onClick={() => moveInterest(index, 1)}><ArrowDown size={15} /></button>
                  <button type="button" className="adm-icon-btn is-danger" title="Xóa" onClick={() => setInterests((currentInterests) => currentInterests.filter((_, i) => i !== index))}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            <div className="cp-interest-row is-new">
              <input
                className="gf-control"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInterest(); } }}
                placeholder="Thêm nhu cầu mới, ví dụ: Thay pin – ắc quy tại nhà"
              />
              <button type="button" className="adm-btn" onClick={addInterest}><Plus size={15} /> Thêm</button>
            </div>
          </div>
        </div>

        <details className="gf-group">
          <summary className="gf-group-summary"><strong>Bản dịch tiếng Anh (tuỳ chọn)</strong></summary>
          <div className="gf-group-body">
            {renderTextField('Dòng nhỏ (Tiếng Anh)', form.enKicker, (value) => setForm({ ...form, enKicker: value }), { placeholder: 'Free consultation' })}
            {renderTextField('Tiêu đề khối (Tiếng Anh)', form.enTitle, (value) => setForm({ ...form, enTitle: value }), { placeholder: 'Leave your number, we will call you back' })}
            {renderTextField('Ghi chú (Tiếng Anh)', form.enNote, (value) => setForm({ ...form, enNote: value }), { rows: 2 })}
          </div>
        </details>
      </section>

    </div>
  );
}
