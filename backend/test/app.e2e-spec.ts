/**
 * Test e2e mẫu của Nest: dựng AppModule và gọi GET /.
 * Dùng bởi: `npm run test:e2e` (cấu hình test/jest-e2e.json).
 * Lưu ý: test còn mong '/' trả 'Hello World!' từ khung Nest ban đầu, API hiện không có route này.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
