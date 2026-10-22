/**
 * Endpoint POST /api/revalidate: xóa fetch-cache theo tag (menu, pages, blog-posts, settings) để site public cập nhật ngay.
 * Dùng bởi: backend gọi (fire-and-forget) mỗi khi admin sửa nội dung, kèm header x-revalidate-secret.
 * Lưu ý: cần biến môi trường REVALIDATE_SECRET khớp với backend, thiếu thì mọi yêu cầu bị từ chối 401.
 */
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const ALLOWED_TAGS = new Set(["menu", "pages", "blog-posts", "settings"]);

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ revalidated: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    tags?: unknown;
  } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter(
        (tag): tag is string => typeof tag === "string" && ALLOWED_TAGS.has(tag),
      )
    : [];

  for (const tag of tags) revalidateTag(tag);

  return NextResponse.json({ revalidated: true, tags });
}
