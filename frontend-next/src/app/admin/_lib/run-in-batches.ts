/**
 * Chạy một thao tác API cho nhiều mục, mỗi lượt vài mục song song, để thao tác hàng loạt (chọn nhiều trong bảng) không dồn hàng trăm request cùng lúc.
 * Dùng bởi: products/_components/ProductList.tsx (xuất bản / chuyển nháp / xoá nhiều sản phẩm).
 */
const DEFAULT_BATCH_SIZE = 5;

export async function runInBatches<T>(
  items: T[],
  worker: (item: T) => Promise<unknown>,
  batchSize = DEFAULT_BATCH_SIZE,
): Promise<void> {
  for (let start = 0; start < items.length; start += batchSize) {
    await Promise.all(items.slice(start, start + batchSize).map(worker));
  }
}
