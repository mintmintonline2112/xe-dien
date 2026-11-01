# Quy tắc code của dự án

Thư mục `.claude/rules/` chứa quy tắc bắt buộc khi viết hoặc sửa code trong repo. Claude Code tự nạp mọi file `.md` ở
đây mỗi phiên làm việc (không cần khai trong CLAUDE.md), nên người và AI dùng chung một bộ quy tắc.

| File | Nội dung |
|---|---|
| [comments.md](comments.md) | Comment: chỉ một khối mô tả ở đầu file, trong thân file không comment |
| [naming.md](naming.md) | Đặt tên file, thư mục, hàm, biến: đọc tên là biết nó làm gì |

## Áp dụng thế nào

- **Code mới:** theo quy tắc ngay từ đầu.
- **File đang sửa:** sửa file nào thì dọn luôn file đó theo quy tắc (comment + tên trong phần mình đụng tới). Đổi tên hàm
  export hoặc tên file thì sửa hết chỗ gọi, rồi chạy kiểm tra ở mục dưới.
- **File chưa đụng tới:** giữ nguyên cho tới khi có đợt dọn riêng. Không tự dọn hàng loạt khi chưa được chủ dự án đồng ý.
- **Không đổi hành vi:** dọn comment hay đổi tên thì website phải hiển thị y như cũ: chụp HTML các trang trước và sau khi
  sửa rồi so (`npm run snapshot -- <thư-mục>` trong `frontend-next`, site dev chạy ở cổng 3006; quy trình đầy đủ ở
  `frontend-next/src/app/(site)/_components/sections/README.md` mục 11).

## Kiểm tra sau khi sửa

Repo chưa có test tự động (`npm test`); dùng các lệnh sau:

| Sửa ở đâu | Lệnh |
|---|---|
| `frontend-next/` | `npm run check` — typecheck + ESLint + lint:layers + lint:sections |
| `backend/` | `npx tsc --noEmit -p tsconfig.json`, rồi `npm run build` |
| Giao diện (component, CSS) | thêm bước so HTML / ảnh chụp như mục trên (`npm run snapshot`, `npm run shot`, `npm run diff:png`) |

Thêm quy tắc mới: tạo 1 file `.md` trong thư mục này (Claude Code tự nạp) và thêm 1 dòng vào bảng trên.
