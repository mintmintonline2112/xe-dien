/**
 * Module thư viện media (ảnh, video trong uploads/).
 * Dùng bởi: admin.module.ts.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Media } from './media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Media])],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}
