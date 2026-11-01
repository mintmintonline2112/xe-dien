/**
 * Điểm khởi động API NestJS: CORS, cookie, phục vụ file /uploads và /assets, ValidationPipe, interceptor / filter toàn cục, Swagger.
 * Dùng bởi: `npm run start` / `start:dev` / `start:prod` (dist/main).
 * Lưu ý: CORS chỉ nhận origin đúng bằng FRONTEND_URL (dev mở thêm hostname localhost / 127.0.0.1) — KHÔNG dùng origin.includes('localhost'),
 * vì API bật credentials nên tên miền lạ chứa chữ localhost đọc được phiên đăng nhập. File upload trả kèm nosniff + CSP sandbox
 * để chặn XSS lưu trữ. Swagger lộ toàn bộ endpoint admin nên chỉ mở ở dev hoặc khi SWAGGER_ENABLED=true.
 */
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ServerConfig } from './config/server.config';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  const configService = app.get(ConfigService);
  const serverConfig = configService.get<ServerConfig>('server');

  if (!serverConfig) {
    throw new Error('Server configuration not found');
  }
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  const allowedOrigins = serverConfig.frontendUrl
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const isDev = process.env.NODE_ENV !== 'production';

  const isLocalOrigin = (origin: string): boolean => {
    try {
      const { hostname } = new URL(origin);
      return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::1]'
      );
    } catch {
      return false;
    }
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (isDev && isLocalOrigin(origin))
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS policy'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const setUploadSecurityHeaders = (response: import('express').Response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'none'; sandbox",
    );
    response.setHeader('X-Frame-Options', 'DENY');
  };

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    setHeaders: setUploadSecurityHeaders,
  });

  app.useStaticAssets(join(__dirname, '..', 'src/assets'), {
    prefix: '/assets/',
    setHeaders: setUploadSecurityHeaders,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new TransformInterceptor(),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  const swaggerEnabled = isDev || process.env.SWAGGER_ENABLED === 'true';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Trạm Xe Điện API')
      .setDescription(
        'CMS & API cho website Trạm Xe Điện — sản phẩm, danh mục, trang, tin tức, liên hệ, yêu cầu tư vấn',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(serverConfig.port);

  console.log(
    swaggerEnabled
      ? `🚀 API sẵn sàng — Swagger tại http://localhost:${serverConfig.port}/docs`
      : `🚀 API sẵn sàng tại cổng ${serverConfig.port} (Swagger đang tắt)`,
  );
}

void bootstrap();
