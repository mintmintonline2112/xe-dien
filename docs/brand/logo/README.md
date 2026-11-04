# Logo Trạm Xe Điện — 5 phương án

Năm phương án logo thiết kế ngày 04/11/2026. Tất cả dùng màu và font của website: xanh `#0A7D4F`, xanh đậm `#064A2F` (nền
tối), vàng `#FFB81C`, chữ `#1A2420`, font Be Vietnam Pro. Chưa chọn phương án chính thức; website vẫn dùng biểu tượng tia sét
mặc định trong `frontend-next/src/app/(site)/_components/layout/Brand.tsx`.

Xem cả 5 mẫu: mở [index.html](index.html) bằng trình duyệt.

| # | Phương án | Ý tưởng |
|---|---|---|
| 01 | Ghim trạm sạc | Ghim bản đồ có tia sét: "trạm" là nơi khách tìm đến |
| 02 | Chữ T tia sét | Chữ T của "Trạm" có thân là tia sét vàng, chữ in hoa đậm |
| 03 | Xe điện sân golf | Xe điện mui bằng, đúng dòng xe chủ lực |
| 04 | Mái trạm | Mái nhà che trên tia sét: showroom, xưởng, trạm sạc |
| 05 | Lá xanh tia sét | Chiếc lá có tia sét: xe điện sạch |

## File

| Ở đâu | File | Dùng cho |
|---|---|---|
| `docs/brand/logo/` | `logo-0N-<tên>-bieu-tuong.svg`, `…-bieu-tuong-nen-toi.svg` | Biểu tượng dạng vector (khung 48×48), gửi in ấn / thiết kế |
| `backend/uploads/brand/` | `logo-0N-<tên>-ngang-nen-sang.png` | Logo ngang (biểu tượng + chữ), nền trong suốt, cho header |
| `backend/uploads/brand/` | `logo-0N-<tên>-ngang-nen-toi.png` | Logo ngang trên nền xanh đậm, cho chân trang |
| `backend/uploads/brand/` | `logo-0N-<tên>-bieu-tuong-512.png` | Biểu tượng 512×512, nền trong suốt, cho favicon / avatar |

File PNG nằm trong `backend/uploads/brand/` nên hiện trong **Admin → Thư viện ảnh & video**, thư mục `brand` (backend tự quét
thư mục uploads khi khởi động; trên máy đang chạy thì bấm "Quét lại"). Thư viện không nhận file SVG nên bản vector để ở `docs/`.

Dùng thử một logo trên website: **Admin → Cài đặt → Logo**, chọn file `…-ngang-nen-sang.png` trong Thư viện.
