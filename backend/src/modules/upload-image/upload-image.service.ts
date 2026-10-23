/**
 * Lưu ảnh upload vào uploads/<thư mục con> (kiểm tra cỡ và loại ảnh, nén, đặt tên không trùng) và xoá file trong thư mục uploads.
 * Dùng bởi: modules/admin/blog-posts (ảnh bìa bài viết), modules/admin/auth (ảnh đại diện).
 * Lưu ý: loại ảnh nhận theo nội dung thật (magic bytes), đuôi file lấy theo loại đã nhận dạng, không theo tên người dùng đặt;
 * skipOptimize = admin đã nén trên trình duyệt. deleteFile so đường dẫn SAU khi resolve, vì "uploads/../../x" vẫn bắt đầu bằng "uploads".
 */
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { mkdirSync, existsSync, unlinkSync } from 'fs';
import { join, resolve, sep } from 'path';
import {
  detectImageKind,
  MIME_BY_IMAGE_KIND,
  buildUniqueUploadName,
} from 'src/common/helpers/file.helper';
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  optimizeImage,
} from 'src/common/helpers/image-optimizer.helper';

export class FileSizeLimitException extends BadRequestException {
  constructor() {
    super(`File vượt quá giới hạn ${MAX_UPLOAD_MB}MB`);
  }
}

export class FileTypeException extends BadRequestException {
  constructor() {
    super('Chỉ chấp nhận ảnh jpg, png, webp hoặc gif');
  }
}

export class FileStorageException extends InternalServerErrorException {
  constructor() {
    super('Không lưu được file, vui lòng thử lại');
  }
}

@Injectable()
export class UploadImageService {
  private readonly ROOT_PATH = 'uploads';

  async upload(
    file: Express.Multer.File,
    subFolder: string,
    options: { skipOptimize?: boolean } = {},
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file');
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      throw new FileSizeLimitException();
    }

    const imageKind = detectImageKind(file.buffer);
    if (!imageKind) {
      throw new FileTypeException();
    }

    const targetDir = join(process.cwd(), this.ROOT_PATH, subFolder);

    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    const safeName = file.originalname.replace(/\.[^.]+$/, '') + imageKind;

    const optimized = options.skipOptimize
      ? {
          buffer: file.buffer,
          ext: imageKind,
          mime: MIME_BY_IMAGE_KIND[imageKind],
          changed: false,
        }
      : await optimizeImage(
          file.buffer,
          safeName,
          MIME_BY_IMAGE_KIND[imageKind],
        );
    const baseName = file.originalname.replace(/\.[^.]+$/, '') + optimized.ext;
    const uniqueFileName = buildUniqueUploadName(baseName, (candidate) =>
      existsSync(join(targetDir, candidate)),
    );

    const fullPath = join(targetDir, uniqueFileName);

    try {
      await writeFile(fullPath, optimized.buffer);
    } catch {
      throw new FileStorageException();
    }

    return join(this.ROOT_PATH, subFolder, uniqueFileName).replace(/\\/g, '/');
  }

  deleteFile(filePath: string): void {
    try {
      if (!filePath) return;

      let cleanPath = filePath;

      if (cleanPath.startsWith('http')) {
        cleanPath = new URL(cleanPath).pathname;
      }

      cleanPath = cleanPath.replace(/^\/+/, '');

      if (!cleanPath.startsWith(this.ROOT_PATH)) return;

      const uploadRoot = resolve(process.cwd(), this.ROOT_PATH);
      const absolutePath = resolve(process.cwd(), cleanPath);

      if (
        absolutePath !== uploadRoot &&
        !absolutePath.startsWith(uploadRoot + sep)
      ) {
        return;
      }

      if (existsSync(absolutePath)) {
        unlinkSync(absolutePath);
      }
    } catch (error) {
      console.error('Delete file failed:', error);
    }
  }
}
