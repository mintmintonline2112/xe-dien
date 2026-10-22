/**
 * Nhóm cấu hình 'jwt': secret và thời hạn access token (mặc định 60m) / refresh token (mặc định 7d).
 * Dùng bởi: config/app-config.module.ts, modules/admin/auth/auth.service.ts, modules/admin/auth/strategies/jwt.strategy.ts.
 */
import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
}

export default registerAs('jwt', (): JwtConfig => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  return {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '60m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
  };
});
