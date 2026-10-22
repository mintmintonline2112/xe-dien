/**
 * Lớp bọc cache-manager: lấy-hoặc-tính (`wrap`) và xoá cả namespace bằng cách tăng số version (`invalidate`).
 * Dùng bởi: app-cache.module.ts, invalidate-cache.interceptor.ts, controller client, admin-cache.controller.ts.
 * Lưu ý: tăng version = một lần ghi, không xoá key theo wildcard, nên chạy giống nhau trên bộ nhớ và Redis.
 * invalidate() còn gọi POST {STOREFRONT_URL}/api/revalidate (tag = namespace bỏ tiền tố `client:`), không chờ, lỗi thì bỏ qua;
 * thiếu STOREFRONT_URL hoặc REVALIDATE_SECRET thì không gọi. TTL mục cache 2 phút, key version 7 ngày.
 */
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AppCacheService {
  static readonly DEFAULT_TTL = 120_000;
  private static readonly VERSION_TTL = 7 * 24 * 60 * 60 * 1000;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  static keyOf(input: Record<string, unknown> | string | number): string {
    if (input === null || typeof input !== 'object') return String(input);
    const params = input as Record<string, unknown>;
    const parts = Object.keys(params)
      .filter(
        (key) =>
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== '',
      )
      .sort()
      .map((key) => `${key}=${String(params[key])}`);
    return parts.length ? parts.join('&') : 'default';
  }

  private versionKeyOf(namespace: string): string {
    return `${namespace}:__ver`;
  }

  private async readVersion(namespace: string): Promise<number> {
    return (await this.cache.get<number>(this.versionKeyOf(namespace))) ?? 1;
  }

  async wrap<T>(
    namespace: string,
    keyPart: string,
    producer: () => Promise<T>,
    ttl: number = AppCacheService.DEFAULT_TTL,
  ): Promise<T> {
    const version = await this.readVersion(namespace);
    const key = `${namespace}:v${version}:${keyPart}`;

    const cachedValue = await this.cache.get<T>(key);
    if (cachedValue !== undefined && cachedValue !== null) return cachedValue;

    const data = await producer();
    await this.cache.set(key, data, ttl);
    return data;
  }

  async invalidate(namespace: string): Promise<void> {
    const version = await this.readVersion(namespace);
    await this.cache.set(
      this.versionKeyOf(namespace),
      version + 1,
      AppCacheService.VERSION_TTL,
    );

    this.revalidateStorefront(namespace.replace(/^client:/, ''));
  }

  private revalidateStorefront(tag: string): void {
    const storefrontUrl = process.env.STOREFRONT_URL;
    const secret = process.env.REVALIDATE_SECRET;
    if (!storefrontUrl || !secret) return;

    void fetch(`${storefrontUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ tags: [tag] }),
    }).catch((): void => undefined);
  }
}
