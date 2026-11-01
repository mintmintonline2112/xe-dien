/**
 * Chạy công cụ catalog-importer (thư mục catalog-importer/ ở gốc repo) từ trang quản trị: cào danh mục site nguồn ra lượt cào,
 * xem trước sản phẩm, đẩy lượt cào vào CMS. Mỗi lúc chỉ chạy một việc; nhật ký giữ trong bộ nhớ, mất khi restart backend.
 * Dùng bởi: catalog-import.controller.ts.
 * Lưu ý: tool chạy thành tiến trình node con và đẩy dữ liệu qua chính API admin bằng access token ký riêng (hạn 3 giờ) mang quyền
 * của người bấm — người đó thiếu quyền upload Thư viện thì sản phẩm vẫn vào nhưng không có ảnh. Đổi chỗ tool bằng env
 * CATALOG_IMPORTER_DIR (mặc định ../catalog-importer tính từ thư mục chạy backend); trên VPS phải `npm ci` trong thư mục đó.
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ChildProcess, spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';
import { readdir, readFile, rm } from 'fs/promises';
import { join, resolve } from 'path';
import { JwtConfig } from 'src/config/jwt.config';
import { ServerConfig } from 'src/config/server.config';
import { JwtAdmin } from '../auth/strategies/jwt.strategy';
import { StartCrawlDto } from './dto/start-crawl.dto';
import { StartPushDto } from './dto/start-push.dto';
import type {
  CatalogRunDetail,
  CatalogRunFile,
  CatalogRunSummary,
  ImportJob,
  ImportJobKind,
  ImportJobStatus,
} from './catalog-import.types';

const RUN_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,120}$/;
const RUNS_FOLDER = 'catalog-runs';
const MAX_LOG_LINES = 400;
const PUSH_TOKEN_TTL = '3h';

interface JobStart {
  kind: ImportJobKind;
  runId: string;
  isDryRun: boolean;
  args: string[];
  extraEnv: Record<string, string>;
  user: JwtAdmin;
}

@Injectable()
export class CatalogImportService implements OnModuleDestroy {
  private readonly importerDir = resolve(
    process.env.CATALOG_IMPORTER_DIR ??
      join(process.cwd(), '..', 'catalog-importer'),
  );
  private job: ImportJob | null = null;
  private child: ChildProcess | null = null;
  private openLogLine = '';
  private isCancelRequested = false;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  onModuleDestroy() {
    this.child?.kill();
  }

  private get runsDir(): string {
    return join(this.importerDir, RUNS_FOLDER);
  }

  private get cliPath(): string {
    return join(this.importerDir, 'bin', 'catalog-importer.mjs');
  }

  private assertToolInstalled() {
    if (!existsSync(this.cliPath)) {
      throw new BadRequestException(
        `Không thấy công cụ catalog-importer ở ${this.importerDir} (đặt env CATALOG_IMPORTER_DIR)`,
      );
    }
    if (!existsSync(join(this.importerDir, 'node_modules', 'cheerio'))) {
      throw new BadRequestException(
        'catalog-importer chưa cài gói: chạy "npm ci" trong thư mục catalog-importer',
      );
    }
  }

  private assertIdle() {
    if (this.job?.status === 'running') {
      throw new ConflictException(
        'Đang có một lượt cào / nhập chạy — chờ xong hoặc bấm Dừng',
      );
    }
  }

  private runDirOf(runId: string): string {
    if (!RUN_ID_PATTERN.test(runId)) {
      throw new BadRequestException('Mã lượt cào không hợp lệ');
    }
    const runDir = join(this.runsDir, runId);
    if (!existsSync(join(runDir, 'products.json'))) {
      throw new NotFoundException('Không thấy lượt cào này');
    }
    return runDir;
  }

  private async readRunFile(runDir: string): Promise<CatalogRunFile> {
    const raw = await readFile(join(runDir, 'products.json'), 'utf8');
    return JSON.parse(raw) as CatalogRunFile;
  }

  private toRunSummary(id: string, run: CatalogRunFile): CatalogRunSummary {
    return {
      id,
      source: run.source,
      profile: run.profile,
      crawledAt: run.crawledAt,
      productCount: run.products?.length ?? 0,
    };
  }

  async listProfiles(): Promise<string[]> {
    const profilesDir = join(this.importerDir, 'src', 'profiles');
    if (!existsSync(profilesDir)) return [];
    const files = await readdir(profilesDir);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace(/\.json$/, ''))
      .sort();
  }

  async listRuns(): Promise<CatalogRunSummary[]> {
    if (!existsSync(this.runsDir)) return [];
    const runIds = (await readdir(this.runsDir)).filter((name) =>
      RUN_ID_PATTERN.test(name),
    );
    const runs = await Promise.all(
      runIds.map(async (runId) => {
        try {
          const run = await this.readRunFile(join(this.runsDir, runId));
          return this.toRunSummary(runId, run);
        } catch {
          return null;
        }
      }),
    );
    return runs
      .filter((run): run is CatalogRunSummary => run !== null)
      .sort((a, b) => String(b.crawledAt).localeCompare(String(a.crawledAt)));
  }

  async getOverview() {
    return {
      toolDir: this.importerDir,
      profiles: await this.listProfiles(),
      runs: await this.listRuns(),
      job: this.job,
    };
  }

  async getRun(runId: string): Promise<CatalogRunDetail> {
    const run = await this.readRunFile(this.runDirOf(runId));
    return {
      ...this.toRunSummary(runId, run),
      products: (run.products ?? []).map((product) => ({
        sourceUrl: product.sourceUrl,
        title: product.title,
        code: product.code,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        isOutOfStock: product.isOutOfStock,
        imageCount: product.images?.length ?? 0,
        downloadedImageCount:
          product.images?.filter((image) => image.file).length ?? 0,
        specCount: product.specs?.length ?? 0,
      })),
    };
  }

  async deleteRun(runId: string) {
    const runDir = this.runDirOf(runId);
    if (this.job?.status === 'running' && this.job.runId === runId) {
      throw new ConflictException('Lượt cào này đang chạy, dừng trước khi xoá');
    }
    await rm(runDir, { recursive: true, force: true });
    return { id: runId };
  }

  getJob(): ImportJob | null {
    return this.job;
  }

  async startCrawl(dto: StartCrawlDto, user: JwtAdmin): Promise<ImportJob> {
    this.assertIdle();
    this.assertToolInstalled();
    if (!(await this.listProfiles()).includes(dto.profile)) {
      throw new BadRequestException(`Không có hồ sơ site "${dto.profile}"`);
    }
    const runId = this.buildRunId(dto.url);
    const args = [
      'crawl',
      `--url=${dto.url}`,
      `--profile=${dto.profile}`,
      `--out=${join(RUNS_FOLDER, runId)}`,
    ];
    if (dto.maxPages) args.push(`--pages=${dto.maxPages}`);
    if (dto.limit) args.push(`--limit=${dto.limit}`);
    if (dto.maxImages) args.push(`--max-images=${dto.maxImages}`);
    if (!dto.withImages) args.push('--no-images');
    return this.startJob({
      kind: 'crawl',
      runId,
      isDryRun: false,
      args,
      extraEnv: {},
      user,
    });
  }

  async startPush(
    dto: StartPushDto,
    user: JwtAdmin,
    mediaBaseUrl: string,
  ): Promise<ImportJob> {
    this.assertIdle();
    this.assertToolInstalled();
    const runDir = this.runDirOf(dto.runId);
    const args = [
      'push',
      `--run=${runDir}`,
      `--category=${dto.category}`,
      `--api=${this.buildInternalApiUrl()}`,
      `--status=${dto.status}`,
      `--media-base-url=${mediaBaseUrl}`,
    ];
    if (dto.subRules?.trim()) args.push(`--sub=${dto.subRules.trim()}`);
    if (dto.update) args.push('--update');
    if (dto.dryRun) args.push('--dry-run');
    const extraEnv = dto.dryRun
      ? {}
      : { CATALOG_IMPORTER_TOKEN: await this.signPushToken(user) };
    return this.startJob({
      kind: 'push',
      runId: dto.runId,
      isDryRun: dto.dryRun,
      args,
      extraEnv,
      user,
    });
  }

  cancelJob(): ImportJob | null {
    if (this.job?.status === 'running' && this.child) {
      this.isCancelRequested = true;
      this.child.kill();
    }
    return this.job;
  }

  private buildRunId(sourceUrl: string): string {
    const pathSlug =
      new URL(sourceUrl).pathname
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'catalog';
    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
    const baseId = `${pathSlug}-${stamp}`;
    let runId = baseId;
    for (let suffix = 2; existsSync(join(this.runsDir, runId)); suffix++) {
      runId = `${baseId}-${suffix}`;
    }
    return runId;
  }

  private buildInternalApiUrl(): string {
    const server = this.configService.getOrThrow<ServerConfig>('server');
    return `http://127.0.0.1:${server.port}/api`;
  }

  private signPushToken(user: JwtAdmin): Promise<string> {
    const jwtConfig = this.configService.getOrThrow<JwtConfig>('jwt');
    const payload: JwtAdmin = {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type,
      staff_code: user.staff_code,
      role: user.role,
      permissions: user.permissions,
      modules: user.modules,
    };
    return this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessTokenSecret,
      expiresIn: PUSH_TOKEN_TTL,
    } as JwtSignOptions);
  }

  private startJob(start: JobStart): ImportJob {
    const job: ImportJob = {
      id: randomUUID(),
      kind: start.kind,
      runId: start.runId,
      isDryRun: start.isDryRun,
      status: 'running',
      startedBy: start.user.name || start.user.email,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      log: [],
    };
    const child = spawn(process.execPath, [this.cliPath, ...start.args], {
      cwd: this.importerDir,
      env: { ...process.env, ...start.extraEnv },
      windowsHide: true,
    });
    this.job = job;
    this.child = child;
    this.openLogLine = '';
    this.isCancelRequested = false;

    const appendChunk = (chunk: Buffer) =>
      this.appendLog(job, chunk.toString('utf8'));
    child.stdout?.on('data', appendChunk);
    child.stderr?.on('data', appendChunk);
    child.on('error', (error) => this.finishJob(job, 'failed', error.message));
    child.on('close', (exitCode) => {
      if (this.isCancelRequested) this.finishJob(job, 'cancelled', 'Đã dừng.');
      else this.finishJob(job, exitCode === 0 ? 'succeeded' : 'failed');
    });
    return job;
  }

  private appendLog(job: ImportJob, text: string) {
    const lines = (this.openLogLine + text.replace(/\r/g, '')).split('\n');
    this.openLogLine = lines.pop() ?? '';
    this.pushLogLines(job, lines);
  }

  private pushLogLines(job: ImportJob, lines: string[]) {
    job.log.push(...lines);
    if (job.log.length > MAX_LOG_LINES) {
      job.log.splice(0, job.log.length - MAX_LOG_LINES);
    }
  }

  private finishJob(job: ImportJob, status: ImportJobStatus, message?: string) {
    if (job.status !== 'running') return;
    const trailingLines = [this.openLogLine, message].filter(Boolean);
    this.openLogLine = '';
    this.pushLogLines(job, trailingLines);
    job.status = status;
    job.finishedAt = new Date().toISOString();
    if (this.job === job) this.child = null;
  }
}
