/**
 * Biểu tượng logo Trạm Xe Điện (mẫu 01 "Ghim trạm sạc"): ghim bản đồ chứa tia sét, tô bằng màu thương hiệu từ Admin → Cài đặt.
 * Dùng bởi: app/(site)/_components/layout/Brand.tsx (header, chân trang), app/admin/_layout/AdminSidebar.tsx, admin/login LoginScreen.tsx.
 * Lưu ý: `isOnDark` là bản trên nền xanh đậm (ghim vàng). Bản màu cố định cho favicon ở public/favicon.svg; 5 mẫu gốc ở docs/brand/logo/ —
 * đổi hình ở đây thì sửa cả favicon.svg cho khớp.
 */
export function BrandPinMark({ isOnDark = false, className }: { isOnDark?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M24 3.5C14.3 3.5 6.5 11.1 6.5 20.6 6.5 32.6 24 45 24 45s17.5-12.4 17.5-24.4C41.5 11.1 33.7 3.5 24 3.5Z"
        fill={isOnDark ? "var(--gold-400)" : "var(--navy-700)"}
      />
      <circle cx="24" cy="20.5" r="11" fill={isOnDark ? "var(--navy-900)" : "#fff"} />
      <path d="M26.2 11.5 18.3 22.6h5.1l-2 8.4 8.3-11.4h-5.2l1.7-8.1Z" fill="var(--gold-400)" />
    </svg>
  );
}
