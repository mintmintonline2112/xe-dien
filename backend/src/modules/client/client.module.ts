/**
 * Gom các module API công khai cho website: trang, sản phẩm / danh mục sản phẩm, bài blog / danh mục, gửi liên hệ, gửi yêu cầu tư vấn.
 * Dùng bởi: src/app.module.ts.
 * Lưu ý: ContactModule và QuoteRequestsModule nằm ở modules/admin nhưng có cả route công khai, nên được import lại ở đây.
 */
import { Module } from '@nestjs/common';
import { ContactModule } from '../admin/contact/contact.module';
import { QuoteRequestsModule } from '../admin/quote-requests/quote-requests.module';
import { ClientBlogPostsModule } from './blog-posts/blog-posts.module';
import { ClientPagesModule } from './pages/pages.module';
import { ClientProductsModule } from './products/products.module';

@Module({
  imports: [
    ContactModule,
    QuoteRequestsModule,
    ClientBlogPostsModule,
    ClientPagesModule,
    ClientProductsModule,
  ],
})
export class ClientModule {}
