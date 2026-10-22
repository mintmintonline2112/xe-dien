"use client";

/**
 * Các form public gửi API backend: yêu cầu tư vấn / báo giá / trả góp (ConsultForm → POST client/quote-requests) và liên hệ
 * (ContactForm → POST client/contact).
 * Dùng bởi: sections/quote-form/QuoteForm.tsx, sections/contact/Contact.tsx, san-pham/[slug]/page.tsx.
 * Lưu ý: field gửi đi khớp docs/catalog-api.md (fullName, phone, email, province, requestType, productId, productName, message,
 * sourceUrl). Form liên hệ của backend bắt buộc email. Danh sách tỉnh / thành là gợi ý (datalist), khách vẫn gõ tự do được.
 */
import { useState, type FormEvent } from "react";
import { env } from "@/config/env";
import { DEFAULT_INTERESTS } from "@/settings/contact-page";
import { REQUEST_TYPES, type RequestType } from "./request-types";
import { cn } from "@/utils/cn";

const FORM_BODY = "p-[clamp(1.4rem,3.5vw,2.2rem)]";
const FORM_TITLE = "mb-1 font-display text-h4 font-extrabold text-ink";
const FORM_SUBTITLE = "mb-5 text-sm text-ink-faint";
const FIELD_ROW = "grid grid-cols-2 gap-x-4 max-[640px]:grid-cols-1";
const FIELD = "mb-4";
const LABEL = "mb-1.5 block text-sm font-semibold text-ink";
const REQUIRED_MARK = "text-sale";
const FOCUS_RING = "focus:border-navy-700 focus:ring-3 focus:ring-navy-700/15 focus:[outline:none]";
const INPUT = cn(
  "w-full rounded-md border border-line bg-paper px-3.5 py-2.5 font-main text-base text-ink transition-[border-color,box-shadow] duration-180 ease-brand placeholder:text-ink-faint/70",
  FOCUS_RING,
);
const SELECT = cn(INPUT, "invalid:text-ink-faint");
const TEXTAREA = cn(INPUT, "min-h-24 resize-y");
const FORM_ERROR = "m-0 mb-4 text-sm text-danger";
const FORM_PRIVACY = "mt-3 mb-0 text-center text-xs text-ink-faint";
const FORM_WRAPPER = "overflow-hidden rounded-lg border border-line bg-paper text-ink shadow-lift";

const PROVINCES = [
  "TP. Hồ Chí Minh", "Hà Nội", "Hải Phòng", "Đà Nẵng", "Cần Thơ", "Huế",
  "An Giang", "Bắc Ninh", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Điện Biên", "Đồng Nai", "Đồng Tháp",
  "Gia Lai", "Hà Tĩnh", "Hưng Yên", "Khánh Hòa", "Lai Châu", "Lạng Sơn", "Lào Cai", "Lâm Đồng",
  "Nghệ An", "Ninh Bình", "Phú Thọ", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sơn La",
  "Tây Ninh", "Thái Nguyên", "Thanh Hóa", "Tuyên Quang", "Vĩnh Long",
];

const GENERIC_SEND_ERROR = "Chưa gửi được — vui lòng thử lại hoặc gọi hotline.";

async function postJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${env.publicApiUrl}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (response.status === 429) {
    throw new Error("Bạn gửi hơi nhanh — vui lòng đợi một phút rồi thử lại.");
  }
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(payload?.message) ? payload?.message.join(", ") : payload?.message;
    throw new Error(message || GENERIC_SEND_ERROR);
  }
  return response.json().catch(() => null);
}

function readFormValues(form: HTMLFormElement): Record<string, string> {
  return Object.fromEntries(
    [...new FormData(form).entries()].map(([key, value]) => [key, String(value).trim()]),
  );
}

function RequiredMark() {
  return (
    <span className={REQUIRED_MARK} aria-hidden="true">
      {" "}*
    </span>
  );
}

function SuccessPanel({ title, body, onReset, resetLabel }: { title: string; body: string; onReset: () => void; resetLabel: string }) {
  return (
    <div className="p-[clamp(2rem,5vw,3rem)] text-center" role="status">
      <span
        className="mb-4 inline-flex h-14 w-14 animate-[pop_500ms_var(--ease)_both] text-navy-700 motion-reduce:animate-none [&>svg]:h-full [&>svg]:w-full"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m7.5 12.5 3 3 6-6.5" />
        </svg>
      </span>
      <h3 className="text-h4">{title}</h3>
      <p className="mb-5 text-ink-soft">{body}</p>
      <button type="button" className="btn btn-ghost-dark btn-sm" onClick={onReset}>
        {resetLabel}
      </button>
    </div>
  );
}

function useSubmitState() {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  async function submit(form: HTMLFormElement, send: (values: Record<string, string>) => Promise<unknown>) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      await send(readFormValues(form));
      setIsSent(true);
      form.reset();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : GENERIC_SEND_ERROR);
    } finally {
      setIsSending(false);
    }
  }

  return { isSending, error, isSent, setIsSent, submit };
}

export function ConsultForm({
  title = "Đăng ký tư vấn miễn phí",
  subtitle = "Để lại số điện thoại, chuyên viên gọi lại trong 15 phút (8:00 – 21:00).",
  submitLabel = "Gửi yêu cầu tư vấn",
  productId,
  productName,
  defaultType = "consult",
  className,
}: {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  productId?: number;
  productName?: string;
  defaultType?: RequestType;
  className?: string;
}) {
  const { isSending, error, isSent, setIsSent, submit } = useSubmitState();
  const idPrefix = productId ? `consult-${productId}` : "consult";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(event.currentTarget, (values) =>
      postJson("client/quote-requests", {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || undefined,
        province: values.province || undefined,
        requestType: values.requestType || defaultType,
        productId: productId ?? undefined,
        productName: values.productName || productName || undefined,
        message: values.message || undefined,
        sourceUrl: typeof window !== "undefined" ? window.location.href : undefined,
      }),
    );
  }

  if (isSent) {
    return (
      <div className={cn(FORM_WRAPPER, className)}>
        <SuccessPanel
          title="Đã nhận yêu cầu của bạn!"
          body="Chuyên viên tư vấn sẽ gọi lại trong ít phút. Cần gấp, bạn vui lòng gọi hotline để được hỗ trợ ngay."
          onReset={() => setIsSent(false)}
          resetLabel="Gửi yêu cầu khác"
        />
      </div>
    );
  }

  return (
    <div className={cn(FORM_WRAPPER, className)}>
      <form className={FORM_BODY} onSubmit={handleSubmit} noValidate>
        {title ? <h3 className={FORM_TITLE}>{title}</h3> : null}
        {subtitle ? <p className={FORM_SUBTITLE}>{subtitle}</p> : null}

        <div className={FIELD_ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor={`${idPrefix}-name`}>
              Họ và tên
              <RequiredMark />
            </label>
            <input className={INPUT} type="text" id={`${idPrefix}-name`} name="fullName" autoComplete="name" required maxLength={255} />
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor={`${idPrefix}-phone`}>
              Số điện thoại
              <RequiredMark />
            </label>
            <input
              className={INPUT}
              type="tel"
              id={`${idPrefix}-phone`}
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              pattern="[0-9 +.()-]{9,20}"
              placeholder="VD: 0912 345 678"
              required
            />
          </div>
        </div>

        <div className={FIELD_ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor={`${idPrefix}-type`}>
              Bạn cần
            </label>
            <select className={SELECT} id={`${idPrefix}-type`} name="requestType" defaultValue={defaultType}>
              {REQUEST_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor={`${idPrefix}-province`}>
              Tỉnh / thành phố
            </label>
            <input
              className={INPUT}
              type="text"
              id={`${idPrefix}-province`}
              name="province"
              list={`${idPrefix}-provinces`}
              autoComplete="address-level1"
              placeholder="Chọn hoặc nhập"
            />
            <datalist id={`${idPrefix}-provinces`}>
              {PROVINCES.map((province) => (
                <option key={province} value={province} />
              ))}
            </datalist>
          </div>
        </div>

        {productName ? (
          <input type="hidden" name="productName" value={productName} />
        ) : (
          <div className={FIELD}>
            <label className={LABEL} htmlFor={`${idPrefix}-product`}>
              Mẫu xe quan tâm
            </label>
            <input className={INPUT} type="text" id={`${idPrefix}-product`} name="productName" placeholder="VD: xe máy điện đi học, xe điện 3 bánh chở hàng…" />
          </div>
        )}

        <div className={FIELD}>
          <label className={LABEL} htmlFor={`${idPrefix}-message`}>
            Ghi chú
          </label>
          <textarea className={TEXTAREA} id={`${idPrefix}-message`} name="message" rows={3} placeholder="Nhu cầu sử dụng, ngân sách, thời gian muốn nhận xe…" />
        </div>

        {error ? (
          <p className={FORM_ERROR} role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-sale btn-block btn-lg" disabled={isSending}>
          {isSending ? "Đang gửi…" : submitLabel}
        </button>
        <p className={FORM_PRIVACY}>Thông tin chỉ dùng để tư vấn, không chia sẻ cho bên thứ ba.</p>
      </form>
    </div>
  );
}

export function ContactForm({
  title = "Gửi lời nhắn cho chúng tôi",
  interests = DEFAULT_INTERESTS.map((interest) => interest.value),
  note = "Các ô có dấu * là bắt buộc. Chúng tôi phản hồi trong vòng 24 giờ làm việc.",
}: {
  title?: string;
  interests?: string[];
  note?: string;
}) {
  const { isSending, error, isSent, setIsSent, submit } = useSubmitState();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submit(event.currentTarget, (values) =>
      postJson("client/contact", {
        fullname: values.fullname,
        email: values.email,
        phone: values.phone,
        subject: values.subject,
        message: values.message,
      }),
    );
  }

  if (isSent) {
    return (
      <div className={cn(FORM_WRAPPER, "reveal is-visible")}>
        <SuccessPanel
          title="Cảm ơn bạn đã liên hệ!"
          body="Chúng tôi đã nhận được lời nhắn và sẽ phản hồi sớm nhất qua điện thoại hoặc email."
          onReset={() => setIsSent(false)}
          resetLabel="Gửi lời nhắn khác"
        />
      </div>
    );
  }

  return (
    <div className={cn(FORM_WRAPPER, "reveal")}>
      <form className={FORM_BODY} onSubmit={handleSubmit} noValidate>
        <h3 className={cn(FORM_TITLE, "mb-5")}>{title}</h3>

        <div className={FIELD_ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="cf-name">
              Họ và tên
              <RequiredMark />
            </label>
            <input className={INPUT} type="text" id="cf-name" name="fullname" autoComplete="name" required />
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="cf-phone">
              Số điện thoại
              <RequiredMark />
            </label>
            <input className={INPUT} type="tel" id="cf-phone" name="phone" autoComplete="tel" inputMode="tel" required />
          </div>
        </div>

        <div className={FIELD_ROW}>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="cf-email">
              Email
              <RequiredMark />
            </label>
            <input className={INPUT} type="email" id="cf-email" name="email" autoComplete="email" required />
          </div>
          <div className={FIELD}>
            <label className={LABEL} htmlFor="cf-subject">
              Chủ đề
            </label>
            <select className={SELECT} id="cf-subject" name="subject" defaultValue={interests[0] ?? ""}>
              {interests.map((interest) => (
                <option key={interest} value={interest}>
                  {interest}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={FIELD}>
          <label className={LABEL} htmlFor="cf-message">
            Nội dung
            <RequiredMark />
          </label>
          <textarea className={TEXTAREA} id="cf-message" name="message" rows={5} minLength={10} required />
        </div>

        {error ? (
          <p className={FORM_ERROR} role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary btn-block" disabled={isSending}>
          {isSending ? "Đang gửi…" : "Gửi lời nhắn"}
        </button>
        {note ? <p className={FORM_PRIVACY}>{note}</p> : null}
      </form>
    </div>
  );
}
