/**
 * Kiểm tra biến môi trường lúc khởi động: báo lỗi khi thiếu DB_* / JWT_*, điền mặc định cho DB_PORT, PORT, JWT_EXPIRES, FRONTEND_URL.
 * Dùng bởi: config/app-config.module.ts (ConfigModule.forRoot validate).
 */
type Env = NodeJS.ProcessEnv;

function requireEnv(env: Env, key: string): string {
  const value = env[key];
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function toIntegerString(value: string | undefined, fallback: number): string {
  if (!value) return String(fallback);
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return String(fallback);
  return String(parsed);
}

export function validateEnv(env: Env): Env {
  requireEnv(env, 'DB_TYPE');
  requireEnv(env, 'DB_HOST');
  requireEnv(env, 'DB_USERNAME');
  requireEnv(env, 'DB_PASSWORD');
  requireEnv(env, 'DB_NAME');

  env.DB_PORT = toIntegerString(env.DB_PORT, 3306);

  requireEnv(env, 'JWT_ACCESS_SECRET');
  requireEnv(env, 'JWT_REFRESH_SECRET');
  env.JWT_EXPIRES = env.JWT_EXPIRES ?? '1d';

  env.PORT = toIntegerString(env.PORT, 3018);
  env.FRONTEND_URL = env.FRONTEND_URL ?? 'http://localhost:3008';

  return env;
}
