/**
 * Nhóm cấu hình 'server': cổng chạy API, FRONTEND_URL (danh sách origin CORS, cách nhau dấu phẩy) và NODE_ENV.
 * Dùng bởi: config/app-config.module.ts, src/main.ts.
 */
import { registerAs } from '@nestjs/config';

export interface ServerConfig {
  port: number;
  frontendUrl: string;
  env?: string;
}

export default registerAs(
  'server',
  (): ServerConfig => ({
    port: Number(process.env.PORT ?? 3018),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3008',
    env: process.env.NODE_ENV,
  }),
);
