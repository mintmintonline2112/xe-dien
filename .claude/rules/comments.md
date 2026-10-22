# Comment

## Quy tắc

1. **Mỗi file có đúng một khối comment ở đầu file.** Viết tiếng Việt, 2–6 dòng, trả lời 3 câu:
   - File này làm gì?
   - Ai dùng nó (file / trang / lệnh nào gọi tới)?
   - Có điều gì phải biết trước khi sửa không? (chỉ ghi khi có)
2. **Trong thân file không viết comment.** Không comment trên hàm, biến, khối code, tham số, không comment cuối dòng.
   Tên hàm và tên biến phải tự nói lên nó làm gì (xem [naming.md](naming.md)). Thấy cần comment để giải thích một đoạn code
   thì đặt lại tên hoặc tách hàm cho rõ, không viết comment.
3. **Điều bắt buộc phải biết** (vì sao làm vậy, con số đo thực tế, chỗ dễ làm hỏng) thì ghi vào khối đầu file, mục
   "Lưu ý". Không rải rác trong thân file.
4. **Không để lại code đã comment lại** (code cũ bị tắt bằng `//`). Cần thì xem lịch sử git.
5. **Thông tin dài đặt đúng chỗ, không nhét vào comment:**

   | Loại thông tin | Đặt ở đâu |
   |---|---|
   | Cách dùng tính năng, cú pháp JSON, ví dụ | `README.md` |
   | Kế hoạch, lịch sử làm, số đo, quyết định đã cân nhắc | `docs/` (VD `docs/migration/PLAN.md`), mục trạng thái trong README của khu đó |
   | Vì sao sửa lần này | Commit message |
   | Kiểu dữ liệu, ý nghĩa field | Tên field rõ nghĩa trong `types.ts` / `*.d.mts` |

## Mẫu khối đầu file

TypeScript / JavaScript:

```ts
/**
 * Nạp font Google cho video bản tin và reel, mỗi font chỉ nạp một lần.
 * Dùng bởi: src/theme/looks.ts (bản tin), src/reel/lib/fonts.ts (reel).
 * Lưu ý: thêm font = 1 dòng ở src/config/fonts.mjs + 1 dòng import ở đây (test/fonts.test.mjs bắt thiếu).
 */
```

Python: khối `"""…"""` ngay đầu file. CSS: `/* … */` đầu file.
JSON không có comment: dùng field `"$doc"` ở đầu file, cùng quy tắc (ngắn, chỉ mô tả file).

## Ví dụ

Không đạt (comment trong thân file, lặp lại điều tên hàm đã nói):

```ts
/** Nạp font của look đang dùng — chỉ look đó, không kéo cả 7 họ chữ về mỗi lần render. */
export const ensureLookFonts = (look: LookTokens): void => {
  loadVideoFont(look.fonts.heading, 'news'); // font tiêu đề
  loadVideoFont(look.fonts.body, 'news'); // font nội dung
};
```

Đạt (không comment, tên đã đủ nghĩa; điều cần biết nằm ở khối đầu file):

```ts
export const loadLookFonts = (look: LookTokens): void => {
  loadVideoFont(look.fonts.heading, 'news');
  loadVideoFont(look.fonts.body, 'news');
};
```

## Ngoại lệ

- Chỉ thị cho công cụ thì giữ, vì không phải comment giải thích: `// eslint-disable-next-line …`, `// @ts-expect-error …`,
  `/* @vite-ignore */`.
- Test (khi repo có test, `*.test.mjs`): tên test là câu mô tả đầy đủ nên cũng không cần comment trong thân.
- Chỉ thị của script kiểm tra trong repo: `// lint-sections-ignore R2: <lý do>` (xem `scripts/lint-sections.mjs`).
