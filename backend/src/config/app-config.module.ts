/**
 * Module cấu hình toàn cục: kiểm tra biến môi trường (env.validation.ts) và nạp nhóm cấu hình database, jwt, mail, server.
 * Dùng bởi: src/app.module.ts, database/seeding/seeding.module.ts, scripts/layout-sync/layout-sync.shared.ts.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';
import jwtConfig from './jwt.config';
import mailConfig from './mail.config';
import serverConfig from './server.config';
import { validateEnv } from './env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      validate: validateEnv,
      load: [databaseConfig, jwtConfig, mailConfig, serverConfig],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
