/**
 * Thư viện media: liệt kê / tìm file qua bảng media, đồng bộ bảng với thư mục uploads/, upload ảnh, ghi nhận video, sửa alt, xoá, tìm nơi đang dùng file.
 * Dùng bởi: library.controller.ts (API /admin/library).
 * Lưu ý: ổ đĩa là nguồn sự thật; sync() chạy lúc khởi động (lỗi không chặn app) và khi admin bấm "Quét lại" sau khi thêm / xoá file bằng FTP; file bị ghi đè thì giữ nguyên alt.
 * Lưu ý: nhận dạng ảnh theo magic bytes, không tin mimetype (chặn XSS lưu trữ qua .svg / .html giả ảnh); sharp.cache(false) để xoá file ngay sau khi đọc không bị EBUSY trên Windows.
 * Lưu ý: resolveUploadPath so kèm dấu phân cách để thư mục anh em (uploads-backup) không lọt; findUsages dò bằng LIKE, bảng / cột lỗi thì bỏ qua để không chặn việc xoá.
 */
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { existsSync } from 'fs';
import { readdir, stat, unlink, writeFile, mkdir } from 'fs/promises';
import { extname, join, relative, resolve, sep } from 'path';
import sharp from 'sharp';
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
import { Media, MediaKind } from './media.entity';
import { LibraryImage, LibraryVideo, MediaUsage } from './library.types';

const USAGE_SOURCES: Array<{
  table: string;
  label: string;
  titleColumn: string;
  columns: string[];
}> = [
  {
    table: 'blog_posts',
    label: 'Bài viết',
    titleColumn: 'title',
    columns: [
      'cover_image_path',
      'og_image_path',
      'video_path',
      'content',
      'metadata',
      'translations',
    ],
  },
  {
    table: 'blog_categories',
    label: 'Danh mục blog',
    titleColumn: 'name',
    columns: ['og_image_path', 'translations'],
  },
  {
    table: 'pages',
    label: 'Trang',
    titleColumn: 'title',
    columns: ['og_image_path', 'translations'],
  },
  {
    table: 'page_sections',
    label: 'Page section',
    titleColumn: 'section_key',
    columns: ['media_path', 'content', 'metadata', 'translations'],
  },
  {
    table: 'site_settings',
    label: 'Cài đặt website',
    titleColumn: 'key',
    columns: ['value'],
  },
];

@Injectable()
export class LibraryService implements OnModuleInit {
  private readonly logger = new Logger(LibraryService.name);
  private readonly uploadsRoot = resolve(process.cwd(), 'uploads');
  private readonly imageExtensions = new Set([
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
  ]);
  private readonly videoExtensions = new Set(['.mp4', '.webm', '.mov']);

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    private readonly dataSource: DataSource,
  ) {
    sharp.cache(false);
  }

  async onModuleInit(): Promise<void> {
    try {
      const result = await this.sync();
      if (result.added || result.removed || result.updated) {
        this.logger.log(
          `Đồng bộ thư viện: +${result.added} / -${result.removed} / ~${result.updated}`,
        );
      }
    } catch (error) {
      this.logger.warn(`Bỏ qua đồng bộ thư viện lúc khởi động: ${error}`);
    }
  }

  async findAll(
    baseUrl: string,
    query: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      folder?: string;
      type?: MediaKind | 'all' | string;
    } = {},
  ): Promise<{
    data: LibraryImage[];
    meta: { total: number; page: number; limit: number; totalPages: number };
    folders: string[];
    totalSize: number;
  }> {
    const page = this.parsePositiveInteger(query.page, 1);
    const limit = this.parsePositiveInteger(query.limit, 24, 100);
    const search = query.search?.trim();
    const folder = query.folder?.trim();
    const type =
      query.type === 'image' || query.type === 'video' ? query.type : 'all';

    const listQuery = this.mediaRepo.createQueryBuilder('m');
    if (type !== 'all') listQuery.andWhere('m.kind = :kind', { kind: type });
    if (folder && folder !== 'all') {
      listQuery.andWhere('m.folder = :folder', { folder });
    }
    if (search) {
      listQuery.andWhere(
        '(m.name LIKE :s OR m.path LIKE :s OR m.alt LIKE :s)',
        {
          s: `%${search}%`,
        },
      );
    }

    const [rows, total] = await listQuery
      .orderBy('m.modifiedAt', 'DESC')
      .addOrderBy('m.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const [folderRows, totals] = await Promise.all([
      this.mediaRepo
        .createQueryBuilder('m')
        .select('DISTINCT m.folder', 'folder')
        .orderBy('folder', 'ASC')
        .getRawMany<{ folder: string }>(),
      this.mediaRepo
        .createQueryBuilder('m')
        .select('COALESCE(SUM(m.size), 0)', 'sum')
        .getRawOne<{ sum: string }>(),
    ]);

    return {
      data: rows.map((row) => this.toLibraryImage(row, baseUrl)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      folders: folderRows.map((folderRow) => folderRow.folder),
      totalSize: Number(totals?.sum ?? 0),
    };
  }

  async sync(): Promise<{ added: number; removed: number; updated: number }> {
    if (!existsSync(this.uploadsRoot)) {
      const removed = await this.mediaRepo.count();
      if (removed) await this.mediaRepo.clear();
      return { added: 0, removed, updated: 0 };
    }

    const diskFiles = await this.scanDirectory(this.uploadsRoot);
    const diskFileByPath = new Map(diskFiles.map((file) => [file.path, file]));
    const existingRows = await this.mediaRepo.find();
    const existingRowByPath = new Map(
      existingRows.map((row) => [row.path, row]),
    );

    let added = 0;
    let removed = 0;
    let updated = 0;

    const rowsToInsert: Media[] = [];
    for (const [path, file] of diskFileByPath) {
      const row = existingRowByPath.get(path);
      if (!row) {
        rowsToInsert.push(
          this.mediaRepo.create({
            ...file,
            ...(await this.readDimensions(file)),
          }),
        );
        added += 1;
        continue;
      }
      const isFileChanged =
        row.size !== file.size ||
        row.modifiedAt?.getTime() !== file.modifiedAt.getTime();
      if (isFileChanged) {
        Object.assign(row, file, await this.readDimensions(file));
        await this.mediaRepo.save(row);
        updated += 1;
      }
    }
    if (rowsToInsert.length) {
      await this.mediaRepo.save(rowsToInsert, { chunk: 200 });
    }

    const orphanIds = existingRows
      .filter((row) => !diskFileByPath.has(row.path))
      .map((row) => row.id);
    if (orphanIds.length) {
      await this.mediaRepo.delete({ id: In(orphanIds) });
      removed = orphanIds.length;
    }

    return { added, removed, updated };
  }

  async upload(
    file: Express.Multer.File,
    folder: string | undefined,
    baseUrl: string,
    options: { skipOptimize?: boolean; staffId?: string } = {},
  ): Promise<LibraryImage> {
    if (!file) throw new BadRequestException('Vui lòng chọn file');
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        `File vượt quá giới hạn ${MAX_UPLOAD_MB}MB`,
      );
    }
    const kind = detectImageKind(file.buffer);
    if (!kind) {
      throw new BadRequestException(
        'Chỉ chấp nhận ảnh jpg, png, webp hoặc gif',
      );
    }

    const safeFolder =
      (folder || '').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase() || 'library';
    const targetDir = resolve(this.uploadsRoot, safeFolder);
    if (!targetDir.startsWith(this.uploadsRoot)) {
      throw new BadRequestException('Thư mục không hợp lệ');
    }
    await mkdir(targetDir, { recursive: true });

    const safeName = file.originalname.replace(/\.[^.]+$/, '') + kind;

    const optimized = options.skipOptimize
      ? {
          buffer: file.buffer,
          ext: kind,
          mime: MIME_BY_IMAGE_KIND[kind],
          changed: false,
        }
      : await optimizeImage(file.buffer, safeName, MIME_BY_IMAGE_KIND[kind]);

    const baseName = safeName.replace(/\.[^.]+$/, '') + optimized.ext;
    const name = buildUniqueUploadName(baseName, (candidate) =>
      existsSync(join(targetDir, candidate)),
    );
    const fullPath = join(targetDir, name);
    await writeFile(fullPath, optimized.buffer);

    const fileStat = await stat(fullPath);
    const path = `uploads/${safeFolder}/${name}`;
    const dimensions = await this.probeDimensions(fullPath);

    const row = await this.mediaRepo.save(
      this.mediaRepo.create({
        path,
        name,
        folder: safeFolder,
        kind: 'image',
        extension: extname(name).replace('.', ''),
        mimeType: optimized.mime ?? file.mimetype,
        size: fileStat.size,
        modifiedAt: fileStat.mtime,
        uploadedByStaffId: options.staffId ?? null,
        ...dimensions,
      }),
    );

    return this.toLibraryImage(row, baseUrl);
  }

  async registerVideo(
    file: Express.Multer.File,
    baseUrl: string,
    staffId?: string,
  ): Promise<LibraryVideo> {
    if (!file) throw new BadRequestException('Vui lòng chọn file');
    const path = `uploads/videos/${file.filename}`;
    const fullPath = resolve(this.uploadsRoot, 'videos', file.filename);
    const fileStat = existsSync(fullPath) ? await stat(fullPath) : null;

    await this.mediaRepo.save(
      this.mediaRepo.create({
        path,
        name: file.filename,
        folder: 'videos',
        kind: 'video',
        extension: extname(file.filename).replace('.', ''),
        mimeType: file.mimetype,
        size: fileStat?.size ?? file.size,
        modifiedAt: fileStat?.mtime ?? new Date(),
        uploadedByStaffId: staffId ?? null,
      }),
    );

    return {
      name: file.filename,
      path,
      url: `${baseUrl}/${path}`,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  async updateAlt(id: number, alt: string | null): Promise<Media> {
    const row = await this.mediaRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Không tìm thấy file trong thư viện');
    row.alt = alt?.trim() ? alt.trim().slice(0, 300) : null;
    return this.mediaRepo.save(row);
  }

  async remove(filePath: string): Promise<{ deleted: boolean }> {
    const absolutePath = this.resolveUploadPath(filePath);
    const normalized = this.normalizePath(filePath);

    await this.mediaRepo.delete({ path: normalized });

    if (!existsSync(absolutePath)) return { deleted: false };
    const fileStat = await stat(absolutePath);
    if (!fileStat.isFile())
      throw new BadRequestException('Đường dẫn không phải là file');
    await unlink(absolutePath);

    return { deleted: true };
  }

  async findUsages(filePath: string): Promise<MediaUsage[]> {
    const normalized = this.normalizePath(filePath);
    if (!normalized) return [];
    const pathWithoutUploadsPrefix = normalized.replace(/^uploads\//, '');
    const usages: MediaUsage[] = [];

    for (const source of USAGE_SOURCES) {
      const whereClause = source.columns
        .map((column) => `\`${column}\` LIKE :needle`)
        .join(' OR ');
      try {
        const rows: Array<Record<string, unknown>> =
          await this.dataSource.query(
            `SELECT \`${source.titleColumn}\` AS title FROM \`${source.table}\` WHERE ${whereClause} LIMIT 20`.replace(
              /:needle/g,
              '?',
            ),
            source.columns.map(() => `%${pathWithoutUploadsPrefix}%`),
          );
        for (const row of rows) {
          const title = String(row.title ?? '(không tên)');
          const existingUsage = usages.find(
            (usage) => usage.type === source.label && usage.title === title,
          );
          if (existingUsage) existingUsage.count += 1;
          else usages.push({ type: source.label, title, count: 1 });
        }
      } catch (error) {
        this.logger.warn(`Bỏ qua kiểm tra ${source.table}: ${error}`);
      }
    }

    return usages;
  }

  private toLibraryImage(row: Media, baseUrl: string): LibraryImage {
    return {
      id: row.id,
      kind: row.kind,
      name: row.name,
      path: row.path,
      url: `${baseUrl}/${row.path}`,
      folder: row.folder,
      extension: row.extension,
      size: row.size,
      width: row.width,
      height: row.height,
      alt: row.alt,
      modifiedAt: (row.modifiedAt ?? row.createdAt).toISOString(),
    };
  }

  private async readDimensions(
    file: Pick<Media, 'kind'> & { path: string },
  ): Promise<{ width: number | null; height: number | null }> {
    if (file.kind !== 'image') return { width: null, height: null };
    return this.probeDimensions(resolve(process.cwd(), file.path));
  }

  private async probeDimensions(
    absolutePath: string,
  ): Promise<{ width: number | null; height: number | null }> {
    try {
      const metadata = await sharp(absolutePath).metadata();
      return { width: metadata.width ?? null, height: metadata.height ?? null };
    } catch {
      return { width: null, height: null };
    }
  }

  private async scanDirectory(directory: string): Promise<
    Array<{
      path: string;
      name: string;
      folder: string;
      kind: MediaKind;
      extension: string;
      size: number;
      modifiedAt: Date;
    }>
  > {
    const entries = await readdir(directory, { withFileTypes: true });
    const files: Array<{
      path: string;
      name: string;
      folder: string;
      kind: MediaKind;
      extension: string;
      size: number;
      modifiedAt: Date;
    }> = [];

    for (const entry of entries) {
      const absolutePath = join(directory, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await this.scanDirectory(absolutePath)));
        continue;
      }
      if (!entry.isFile()) continue;

      const extension = extname(entry.name).toLowerCase();
      const kind: MediaKind | null = this.imageExtensions.has(extension)
        ? 'image'
        : this.videoExtensions.has(extension)
          ? 'video'
          : null;
      if (!kind) continue;

      const fileStat = await stat(absolutePath);
      const normalizedPath = relative(this.uploadsRoot, absolutePath).replace(
        /\\/g,
        '/',
      );
      const folder = normalizedPath.includes('/')
        ? normalizedPath.split('/').slice(0, -1).join('/')
        : 'root';

      files.push({
        path: `uploads/${normalizedPath}`,
        name: entry.name,
        folder,
        kind,
        extension: extension.replace('.', ''),
        size: fileStat.size,
        modifiedAt: fileStat.mtime,
      });
    }

    return files;
  }

  private normalizePath(filePath: string): string {
    if (!filePath) return '';
    const clean = filePath
      .replace(/^https?:\/\/[^/]+/i, '')
      .replace(/^\/+/, '')
      .replace(/^uploads[\\/]/, '');
    return `uploads/${clean.replace(/\\/g, '/')}`;
  }

  private resolveUploadPath(filePath: string): string {
    if (!filePath) throw new BadRequestException('Thiếu đường dẫn ảnh');
    const relativePath = this.normalizePath(filePath).replace(/^uploads\//, '');
    const absolutePath = resolve(this.uploadsRoot, relativePath);
    if (
      absolutePath !== this.uploadsRoot &&
      !absolutePath.startsWith(this.uploadsRoot + sep)
    ) {
      throw new BadRequestException('Đường dẫn ảnh không hợp lệ');
    }
    return absolutePath;
  }

  private parsePositiveInteger(
    value: number | string | undefined,
    fallback: number,
    max = 1000,
  ): number {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) return fallback;
    return Math.min(parsed, max);
  }
}
