/**
 * Trang /admin/blog-posts: danh sách bài viết blog.
 * Dùng bởi: Next.js App Router (route /admin/blog-posts).
 */

import { BlogPostList } from '@/app/admin/(protected)/blog-posts/_components/BlogPostList';

export default function AdminBlogPostsPage() {
  return <BlogPostList />;
}
