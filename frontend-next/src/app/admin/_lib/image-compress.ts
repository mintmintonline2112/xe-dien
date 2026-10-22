/**
 * Nén ảnh ngay trên trình duyệt (canvas) trước khi upload, cùng luật với backend image-optimizer.helper.ts, để admin xem trước trước–sau.
 * Dùng bởi: image-compress-dialog/image-compress-dialog.tsx.
 * Lưu ý: cạnh dài tối đa 1920px (không phóng to); JPEG/WebP quality 0.82 hạ dần tới 0.6 tới khi ≤ ~1MB; PNG trong suốt giữ PNG, còn lại → JPEG;
 * ảnh ≤ 300KB và ≤ 1920px hoặc GIF/SVG thì bỏ qua. previewUrl là object URL — nơi dùng phải revoke. Backend vẫn nén lại nếu ảnh còn nặng.
 */
export const CLIENT_COMPRESS = {
  MAX_EDGE: 1920,
  TARGET_BYTES: 1024 * 1024,
  QUALITY: 0.82,
  MIN_QUALITY: 0.6,
  SKIP_BELOW_BYTES: 300 * 1024,
} as const;

export type CompressOptions = {
  maxEdge: number;
  targetBytes: number;
};

export const EDGE_PRESETS: { value: number; label: string; hint: string }[] = [
  { value: 0, label: 'Giữ nguyên', hint: 'Không thu nhỏ' },
  { value: 2560, label: '2560px', hint: 'Màn hình lớn / ảnh nền' },
  { value: 1920, label: '1920px', hint: 'Khuyên dùng cho web' },
  { value: 1280, label: '1280px', hint: 'Ảnh trong bài viết' },
  { value: 800, label: '800px', hint: 'Thumbnail / avatar' },
];

export const SIZE_PRESETS: { value: number; label: string; hint: string }[] = [
  { value: 2 * 1024 * 1024, label: 'Cao', hint: '~2 MB' },
  { value: 1024 * 1024, label: 'Chuẩn', hint: '~1 MB' },
  { value: 512 * 1024, label: 'Nhẹ', hint: '~500 KB' },
  { value: 256 * 1024, label: 'Rất nhẹ', hint: '~250 KB' },
];

export const DEFAULT_COMPRESS_OPTIONS: CompressOptions = {
  maxEdge: CLIENT_COMPRESS.MAX_EDGE,
  targetBytes: CLIENT_COMPRESS.TARGET_BYTES,
};

export type CompressResult = {
  original: File;
  file: File;
  skip: boolean;
  reason?: string;
  width: number;
  height: number;
  outWidth: number;
  outHeight: number;
  previewUrl: string;
};

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function hasTransparency(context: CanvasRenderingContext2D, width: number, height: number): boolean {
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 4000)));
  const data = context.getImageData(0, 0, width, height).data;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (data[(y * width + x) * 4 + 3] < 250) return true;
    }
  }
  return false;
}

function replaceExtension(name: string, extension: string): string {
  return name.replace(/\.[^.]+$/, '') + extension;
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = DEFAULT_COMPRESS_OPTIONS,
): Promise<CompressResult> {
  const maxEdge = options.maxEdge > 0 ? options.maxEdge : Number.POSITIVE_INFINITY;
  const targetBytes = options.targetBytes;
  const mimeType = file.type;
  const skipResult = (reason: string, sourceWidth = 0, sourceHeight = 0): CompressResult => ({
    original: file,
    file,
    skip: true,
    reason,
    width: sourceWidth,
    height: sourceHeight,
    outWidth: sourceWidth,
    outHeight: sourceHeight,
    previewUrl: URL.createObjectURL(file),
  });

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
    return skipResult('Định dạng này không nén (GIF/SVG…)');
  }

  let image: HTMLImageElement;
  try {
    image = await loadImage(file);
  } catch {
    return skipResult('Không đọc được ảnh — giữ nguyên');
  }
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const isTooLarge = Math.max(sourceWidth, sourceHeight) > maxEdge;
  const isTooHeavy = file.size > CLIENT_COMPRESS.SKIP_BELOW_BYTES;
  if (!isTooLarge && !isTooHeavy) return skipResult('Ảnh đã đủ nhẹ', sourceWidth, sourceHeight);

  const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
  const outputWidth = Math.max(1, Math.round(sourceWidth * scale));
  const outputHeight = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext('2d');
  if (!context) return skipResult('Trình duyệt không hỗ trợ canvas', sourceWidth, sourceHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, outputWidth, outputHeight);

  let outputType = mimeType;
  if (mimeType === 'image/png') {
    outputType = hasTransparency(context, outputWidth, outputHeight) ? 'image/png' : 'image/jpeg';
  }

  let blob: Blob | null = null;
  if (outputType === 'image/png') {
    blob = await canvasToBlob(canvas, 'image/png');
  } else {
    let quality: number =
      targetBytes >= 2 * 1024 * 1024 ? 0.9 : targetBytes >= 1024 * 1024 ? CLIENT_COMPRESS.QUALITY : 0.78;
    blob = await canvasToBlob(canvas, outputType, quality);
    while (blob && blob.size > targetBytes && quality > CLIENT_COMPRESS.MIN_QUALITY) {
      quality = Math.max(CLIENT_COMPRESS.MIN_QUALITY, quality - 0.08);
      blob = await canvasToBlob(canvas, outputType, quality);
    }
  }
  if (!blob || blob.size >= file.size) {
    return skipResult('Nén không giảm được thêm', sourceWidth, sourceHeight);
  }

  const extension = outputType === 'image/png' ? '.png' : outputType === 'image/webp' ? '.webp' : '.jpg';
  const compressedFile = new File([blob], replaceExtension(file.name, extension), { type: outputType, lastModified: Date.now() });
  return {
    original: file,
    file: compressedFile,
    skip: false,
    width: sourceWidth,
    height: sourceHeight,
    outWidth: outputWidth,
    outHeight: outputHeight,
    previewUrl: URL.createObjectURL(compressedFile),
  };
}
