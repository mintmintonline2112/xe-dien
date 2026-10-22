/**
 * Dựng tuỳ chọn kết nối TypeORM từ biến môi trường DB_* (mysql / mariadb / mssql, SSL, pool, logging).
 * Dùng bởi: config/database.config.ts (app Nest), database/data-source.ts (CLI migration).
 * Lưu ý: synchronize và migrationsRun luôn tắt; đổi schema chỉ qua migration.
 */
import { DataSourceOptions, LoggerOptions } from 'typeorm';

type Env = NodeJS.ProcessEnv;
type SupportedDbType = 'mysql' | 'mariadb' | 'mssql';

function toBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function toInteger(
  value: string | undefined,
  fallback?: number,
): number | undefined {
  if (value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseLogging(value: string | undefined): LoggerOptions {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  if (normalized === 'all') return 'all';
  if (normalized === 'error') return ['error'];
  if (normalized === 'schema') return ['schema'];
  if (normalized === 'warn' || normalized === 'warning') return ['warn'];
  if (normalized.includes(','))
    return normalized.split(',').map((level) => level.trim()) as any;
  return false;
}

export function createTypeOrmOptionsFromEnv(env: Env): DataSourceOptions {
  const rawType = (env.DB_TYPE ?? '').toLowerCase();
  if (!['mysql', 'mariadb', 'mssql'].includes(rawType)) {
    throw new Error(
      `Unsupported DB_TYPE="${env.DB_TYPE}". Supported: mysql, mariadb, mssql`,
    );
  }
  const dbType = rawType as SupportedDbType;

  const baseOptions = {
    type: dbType,
    host: env.DB_HOST,
    port: toInteger(env.DB_PORT),
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    synchronize: false,
    migrationsRun: false,
    legacySpatialSupport: false,
    logging: parseLogging(env.DB_LOGGING),
  } satisfies DataSourceOptions;

  const isSslEnabled = toBoolean(env.DB_SSL, false);

  if (dbType === 'mysql' || dbType === 'mariadb') {
    const rejectUnauthorized = toBoolean(env.DB_SSL_REJECT_UNAUTHORIZED, true);
    const ssl = isSslEnabled ? { rejectUnauthorized } : undefined;

    return {
      ...(baseOptions as DataSourceOptions),
      ssl,
      extra: {
        ...(isSslEnabled ? { ssl } : {}),
        connectionLimit: toInteger(env.DB_POOL_MAX, 10),
      },
    } as DataSourceOptions;
  }

  if (dbType === 'mssql') {
    const trustServerCertificate = toBoolean(
      env.DB_SSL_TRUST_SERVER_CERTIFICATE,
      false,
    );

    return {
      ...(baseOptions as DataSourceOptions),
      options: {
        encrypt: isSslEnabled,
        trustServerCertificate,
      },
      pool: {
        max: toInteger(env.DB_POOL_MAX, 10),
        min: toInteger(env.DB_POOL_MIN, 0),
        idleTimeoutMillis: toInteger(env.DB_POOL_IDLE_MS, 30000),
      },
    } as DataSourceOptions;
  }

  return baseOptions;
}
