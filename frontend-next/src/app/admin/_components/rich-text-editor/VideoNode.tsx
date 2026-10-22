'use client';

/**
 * Node "video" chèn giữa bài trong TipTap, lưu ra <figure data-video data-orientation data-src class="rt-video is-…"> chứa <video> hoặc <iframe>.
 * Dùng bởi: RichTextEditor.tsx (lệnh setVideo).
 * Lưu ý: sanitize ở site public phải giữ nguyên các thẻ / thuộc tính này để render đúng khung 16:9 / 9:16.
 */

import { Node, mergeAttributes, ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Trash2 } from 'lucide-react';
import { resolveImageUrl } from '@/app/admin/_lib/image-url';
import { toEmbedUrl, isExternalVideo, videoProviderOf, type VideoOrientation } from '@/media/video-source';

export interface VideoAttrs {
  src: string;
  orientation?: VideoOrientation;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (attributes: VideoAttrs) => ReturnType;
    };
  }
}

export const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      orientation: { default: 'landscape' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-video]',
        getAttrs: (element) => {
          const figure = element as HTMLElement;
          const media = figure.querySelector('video, iframe');
          const src = figure.getAttribute('data-src') || media?.getAttribute('src') || '';
          if (!src) return false;
          return {
            src,
            orientation: figure.getAttribute('data-orientation') === 'portrait' ? 'portrait' : 'landscape',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = String(HTMLAttributes.src ?? '');
    const orientation: VideoOrientation = HTMLAttributes.orientation === 'portrait' ? 'portrait' : 'landscape';
    const provider = videoProviderOf(src);
    const figureAttributes = mergeAttributes({
      'data-video': provider,
      'data-orientation': orientation,
      'data-src': src,
      class: `rt-video is-${orientation}`,
    });
    if (provider === 'file') {
      return ['figure', figureAttributes, ['video', { src, controls: 'true', playsinline: 'true', preload: 'metadata' }]];
    }
    const embedSrc = toEmbedUrl(src) ?? src;
    return [
      'figure',
      figureAttributes,
      [
        'iframe',
        {
          src: embedSrc,
          loading: 'lazy',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (attributes) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { orientation: 'landscape', ...attributes } }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});

function VideoNodeView({ node, updateAttributes, selected, editor, deleteNode }: NodeViewProps) {
  const src = String(node.attrs.src ?? '');
  const orientation: VideoOrientation = node.attrs.orientation === 'portrait' ? 'portrait' : 'landscape';
  const isExternal = isExternalVideo(src);
  const embedSrc = isExternal ? toEmbedUrl(src) : null;
  const fileSrc = isExternal ? null : (resolveImageUrl(src) ?? src);

  return (
    <NodeViewWrapper className="rte-video-block" data-selected={selected ? 'true' : undefined}>
      <span className={`rte-video is-${orientation}`} contentEditable={false}>
        {isExternal ? (
          embedSrc ? (
            <iframe src={embedSrc} title="video" allowFullScreen />
          ) : (
            <span className="rte-video-bad">Link không nhúng được: {src}</span>
          )
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={fileSrc ?? undefined} controls preload="metadata" />
        )}
      </span>
      {editor.isEditable && selected && (
        <span className="rte-video-tools" onMouseDown={(e) => e.stopPropagation()}>
          {(
            [
              ['landscape', 'Ngang 16:9'],
              ['portrait', 'Dọc 9:16'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={orientation === key ? 'is-active' : undefined}
              onClick={() => updateAttributes({ orientation: key })}
            >
              {label}
            </button>
          ))}
          <button type="button" className="is-danger" onClick={() => deleteNode()} title="Xóa video">
            <Trash2 size={12} /> Xóa
          </button>
        </span>
      )}
    </NodeViewWrapper>
  );
}
