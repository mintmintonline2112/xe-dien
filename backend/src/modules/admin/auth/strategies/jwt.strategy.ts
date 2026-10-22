/**
 * Chiến lược passport 'jwt-admin': đọc access token từ cookie accessToken (hoặc header Bearer) và trả payload JwtAdmin.
 * Dùng bởi: auth.module.ts; kiểu JwtAdmin dùng ở src/common/decorators/current-user.decorator.ts.
 * Lưu ý: permissions là mảng chuỗi phẳng (vd "PRODUCT_LIST") để cookie dưới 4 KB; đổi dạng thì sửa cả buildPayload trong auth.service.ts.
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from 'src/config/jwt.config';

export interface JwtAdmin {
  id: string;
  name: string;
  email: string;
  type: string;
  staff_code?: string;
  role: {
    id: number;
    name: string;
  };
  permissions: string[];
  modules: string[];
}

const extractAccessTokenFromCookie = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['accessToken'];
  }
  return null;
};

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(configService: ConfigService) {
    const jwt = configService.get<JwtConfig>('jwt');
    if (!jwt) {
      throw new Error('JWT configuration not found');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractAccessTokenFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwt.accessTokenSecret,
    });
  }

  validate(payload: JwtAdmin): JwtAdmin {
    return payload;
  }
}
