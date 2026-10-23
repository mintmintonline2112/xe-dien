/**
 * Làm sạch rich text admin soạn (Tiptap) trước khi render bằng dangerouslySetInnerHTML: bỏ <script>, on*, javascript:/data: URL.
 * Dùng bởi: news/[slug]/page.tsx, sections/_shared (data.ts, blocks.tsx), sections hero, media-cards, generic-block.
 * Lưu ý: chạy phía server nên dữ liệu bẩn sẵn trong DB cũng bị trung hoà lúc render. Ảnh/video lưu dạng uploads/...,
 * /uploads/... hoặc URL tuyệt đối của máy soạn (localhost:3018) đều được đổi về origin public đang chạy.
 */
import sanitizeHtml from 'sanitize-html';
import { env } from '@/config/env';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img',
    'h2',
    'h3',
    'u',
    's',
    'span',
    'figure',
    'figcaption',
    'iframe',
    'video',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    a: ['href', 'name', 'target', 'rel', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'data-align', 'style'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder', 'loading'],
    figure: ['class', 'data-video', 'data-orientation', 'data-src'],
    video: ['src', 'poster', 'controls', 'playsinline', 'preload'],
    p: ['style'],
    h2: ['style'],
    h3: ['style'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^(left|center|right|justify)$/],
      display: [/^block$/],
      'margin-left': [/^auto$/],
      'margin-right': [/^auto$/],
      width: [/^\d+px$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https', 'data'], video: ['http', 'https'] },
  allowedIframeHostnames: [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'youtube-nocookie.com',
    'player.vimeo.com',
  ],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
  },
};

function absolutizeUploadSrc(html: string): string {
  const origin = new URL(env.publicApiUrl).origin;
  return html.replace(
    /src="(?:https?:\/\/[^"/]+)?\/?uploads\//g,
    `src="${origin}/uploads/`,
  );
}

export function sanitizeRichText(html?: string | null): string {
  if (!html) return '';
  return absolutizeUploadSrc(sanitizeHtml(html, SANITIZE_OPTIONS));
}
