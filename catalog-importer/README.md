# catalog-importer

Công cụ dòng lệnh độc lập (Node ≥ 20, chỉ phụ thuộc `cheerio`): cào một danh mục sản phẩm của website nguồn (tên, mã, hãng, giá,
tình trạng, ảnh, thông số, mô tả) ra **thư mục lượt cào** (`products.json` + ảnh), rồi **đẩy** vào CMS qua API admin.
Không đụng database hay code của dự án — copy nguyên thư mục này sang project khác là dùng được.

> **Bản quyền:** chỉ cào nội dung bạn sở hữu hoặc được chủ site cho phép sao chép (VD site cũ của chính khách hàng, nhà cung cấp
> cho phép). Chữ và ảnh của website khác có bản quyền; tôn trọng robots.txt của site nguồn. Công cụ tự nghỉ 1,2 giây giữa các request.

## Cài và chạy

```bash
cd catalog-importer
npm install
node bin/catalog-importer.mjs help
```

Quy trình 2 bước (soát dữ liệu trước khi đẩy):

```bash
# 1. Cào → catalog-runs/o-to-dien-<thời gian>/ (products.json + images/)
node bin/catalog-importer.mjs crawl --url=https://site-nguon.vn/o-to-dien/ --profile=gd3

# 2. Đẩy vào CMS (chạy thử trước bằng --dry-run)
export CATALOG_IMPORTER_EMAIL=admin@gmail.com CATALOG_IMPORTER_PASSWORD='...'
node bin/catalog-importer.mjs push --run=catalog-runs/o-to-dien-<thời gian> --api=http://localhost:3018/api \
  --category=o-to-dien --sub="golf=xe-dien-san-golf,du lich=xe-dien-du-lich,bus=xe-bus-dien" --dry-run
```

Một bước: `import` nhận mọi tham số của `crawl` + `push` (trừ `--run`).

| Lệnh | Tuỳ chọn |
|---|---|
| `crawl` | `--url` (bắt buộc), `--profile=gd3` hoặc đường dẫn JSON, `--out`, `--pages=N`, `--limit=N`, `--max-images=12`, `--delay=1200`, `--no-images` (chỉ ghi link ảnh) |
| `push` | `--run`, `--category`, `--api` (bắt buộc trừ khi `--dry-run`), `--target=nest-cms`, `--sub="từ khoá=slug,…"`, `--update` (ghi đè sản phẩm đã có), `--status=published\|draft`, `--folder=products` (thư mục Thư viện), `--sku-prefix=NK-`, `--media-base-url` (host thay cho link ảnh trong mô tả khi `--api` là địa chỉ nội bộ) |

- `crawl` ghi `products.json` sau mỗi sản phẩm: dừng giữa chừng không mất dữ liệu, chạy lại cùng `--out` thì bỏ qua sản phẩm đã có.
- `push` coi sản phẩm là trùng khi cùng slug hoặc cùng link nguồn (`metadata.importedFrom`); trùng thì bỏ qua trừ khi `--update`.
- `--sub`: tên sản phẩm (dạng không dấu) chứa từ khoá thì vào danh mục con đó, còn lại vào `--category`.

## Định dạng `products.json`

```json
{
  "source": "https://site-nguon.vn/o-to-dien/",
  "profile": "gd3",
  "crawledAt": "2026-11-01T08:00:00.000Z",
  "products": [{
    "sourceUrl": "https://site-nguon.vn/xe-a.html", "title": "Xe A", "slug": "xe-a",
    "code": "123", "brand": "Smart", "price": 39900000, "originalPrice": null, "isOutOfStock": false,
    "specs": [{ "label": "Động cơ", "value": "4000W" }],
    "descriptionHtml": "<p>…</p><img src=\"images/xe-a/xe-a-101.jpg\">",
    "images": [{ "url": "https://site-nguon.vn/upload/a.jpg", "file": "images/xe-a/xe-a-1.jpg" }]
  }]
}
```

Giá là số VNĐ, `null` = "Liên hệ". `images[].file` và `src` ảnh trong mô tả là đường dẫn trong thư mục lượt cào (`null` khi `--no-images`).
Link trỏ về site nguồn trong mô tả đã bị gỡ (giữ chữ).

## Hồ sơ site (`--profile`)

Mỗi giao diện nguồn mô tả bằng một file JSON bộ chọn CSS — xem mẫu `src/profiles/gd3.json`. Site mới: copy file đó, sửa bộ chọn,
chạy `--profile=./site-moi.json` với `--limit=3` để thử.

| Khoá | Ý nghĩa |
|---|---|
| `listing.productLink` | Link sản phẩm trên trang danh sách (bắt buộc) |
| `listing.pageUrlPattern` | Mẫu URL trang N, `{page}`, `{category}` (VD `/page-{page}-{category}/`, `/{category}/?page={page}`) |
| `listing.pageNumberPattern` | Regex lấy số trang từ link phân trang để biết trang cuối |
| `product.title` | Tên sản phẩm (bắt buộc) |
| `product.code`, `brand`, `stock`, `outOfStockPattern` | Mã, hãng, tình trạng (regex nhận "hết hàng") |
| `product.priceBox`, `price`, `originalPrice` | Khung giá, giá bán, giá gốc (gạch ngang) |
| `product.images` | Danh sách `{ selector, attr }` lấy link ảnh (ảnh chính, album) |
| `product.specTableRows` / `specBox` | Hàng bảng thông số / khung thông số dạng dòng "- Nhãn: giá trị" |
| `product.description` | Khung mô tả |

## Đích `nest-cms`

Dành cho bộ CMS NestJS dùng trong các dự án primenutusa / xe-nang (có module `products`, `product-categories`, `library`):
đăng nhập `POST /admin/auth/login`, upload ảnh `POST /admin/library/upload`, tạo / sửa `POST|PUT /admin/products`.
Danh mục `--category` phải có sẵn trong CMS. Mã nguồn lưu vào `sku` dạng `NK-<mã>`, link gốc ở `metadata.importedFrom`.

## Chạy từ trang quản trị (CMS xe-nang)

Trong dự án xe-nang, công cụ đã gắn vào admin: **Sản phẩm → Nhập từ website** (`/admin/product-import`, cần quyền
`PRODUCT_CREATE`). Backend (`backend/src/modules/admin/catalog-import`) chạy `bin/catalog-importer.mjs` thành tiến trình con:

- lượt cào lưu ở `catalog-runs/<slug>-<thời gian>/` trong thư mục này (đổi chỗ tool bằng env `CATALOG_IMPORTER_DIR` của backend);
- `push` không cần mật khẩu: backend ký access token riêng (hạn 3 giờ, quyền của người bấm) truyền qua env
  `CATALOG_IMPORTER_TOKEN`, gọi API qua `http://127.0.0.1:<PORT>/api` và đặt `--media-base-url` = host công khai của API;
- trên VPS phải `npm ci --omit=dev` trong thư mục này (deploy.sh đã làm).

Gắn vào project khác cùng họ CMS: copy thư mục này + module `catalog-import` (backend) + `app/admin/(protected)/product-import`
(frontend), thêm route / mục menu.

## Viết đích mới (CMS khác: WordPress, Shopify, API riêng…)

Tạo `src/targets/<ten>-target.mjs` export `async function pushProducts(run, options, log)` — `run` là nội dung `products.json`,
`options.runDir` là thư mục lượt cào (đọc ảnh từ `join(runDir, image.file)`) — rồi thêm một dòng vào bảng `TARGETS` trong
`bin/catalog-importer.mjs` và chạy với `--target=<ten>`.

## Cấu trúc

```
bin/catalog-importer.mjs        CLI: crawl | push | import | help
src/cli/cli-args.mjs            đọc tham số, mặc định
src/crawl/catalog-crawler.mjs   lệnh crawl: phân trang → chi tiết → ảnh → products.json
src/crawl/product-page-parser.mjs  đọc HTML theo hồ sơ
src/crawl/image-downloader.mjs  tải ảnh vào lượt cào
src/crawl/polite-fetch.mjs      fetch có nghỉ + thử lại
src/crawl/vietnamese-slug.mjs   slug tiếng Việt
src/profiles/                   hồ sơ site (gd3.json) + loader
src/targets/                    đích đẩy dữ liệu (nest-cms)
```
