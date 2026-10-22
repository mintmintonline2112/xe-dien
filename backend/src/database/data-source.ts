/**
 * DataSource TypeORM cho CLI migration (db:run, db:revert, db:gen…) và script chạy ngoài Nest.
 * Dùng bởi: các lệnh `npm run db:*` trong package.json.
 * Lưu ý: glob tính theo __dirname (đổi \ thành / cho Windows) để chạy được cả dev qua ts-node (src/database)
 * lẫn bản build (dist/database) — db:run:prod trên VPS không cần ts-node / devDependencies.
 */
import { join } from 'path';
import { DataSource } from 'typeorm';
import { createTypeOrmOptionsFromEnv } from './typeorm-options';

const fromHere = (...segments: string[]) =>
  join(__dirname, ...segments).replace(/\\/g, '/');

export const AppDataSource = new DataSource({
  ...createTypeOrmOptionsFromEnv(process.env),
  entities: [fromHere('..', 'modules', '**', '*.entity{.ts,.js}')],
  migrations: [fromHere('migrations', '*{.ts,.js}')],
});
