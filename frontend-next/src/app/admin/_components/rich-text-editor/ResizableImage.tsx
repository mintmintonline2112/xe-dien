'use client';

/**
 * Extension ảnh của TipTap có tay kéo đổi cỡ, căn trái/giữa/phải và ô nhập alt; bề rộng lưu ở thuộc tính `width` (px), chiều cao tự theo tỉ lệ.
 * Dùng bởi: RichTextEditor.tsx.
 */

import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useRef } from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

type ImageAlign = 'left' | 'center' | 'right';

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const rawWidth = element.getAttribute('width') || (element as HTMLElement).style?.width || '';
          const parsedWidth = parseInt(String(rawWidth), 10);
          return Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : null;
        },
        renderHTML: (attributes) => (attributes.width ? { width: attributes.width } : {}),
      },
      align: {
        default: 'left',
        parseHTML: (element) => (element.getAttribute('data-align') as ImageAlign) || 'left',
        renderHTML: (attributes) => {
          const alignValue = attributes.align as ImageAlign;
          if (alignValue === 'center') {
            return { 'data-align': 'center', style: 'display:block;margin-left:auto;margin-right:auto' };
          }
          if (alignValue === 'right') {
            return { 'data-align': 'right', style: 'display:block;margin-left:auto' };
          }
          return { 'data-align': 'left' };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

function ImageNodeView({ node, updateAttributes, selected, editor }: NodeViewProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const width = node.attrs.width as number | null;

  function handleResizeStart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const image = imageRef.current;
    if (!image) return;
    const startX = e.clientX;
    const startWidth = image.offsetWidth;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = Math.max(40, Math.round(startWidth + (moveEvent.clientX - startX)));
      updateAttributes({ width: nextWidth });
    };
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  const renderedImage = imageRef.current;
  const shownWidth = width ?? renderedImage?.offsetWidth ?? null;
  const shownHeight =
    shownWidth && renderedImage?.naturalWidth ? Math.round((shownWidth * renderedImage.naturalHeight) / renderedImage.naturalWidth) : null;
  const align = (node.attrs.align as ImageAlign) || 'left';

  const alignButtons: { value: ImageAlign; icon: React.ReactNode }[] = [
    { value: 'left', icon: <AlignLeft size={13} /> },
    { value: 'center', icon: <AlignCenter size={13} /> },
    { value: 'right', icon: <AlignRight size={13} /> },
  ];

  return (
    <NodeViewWrapper className="rte-img-block" style={{ textAlign: align }}>
      <span className="rte-img-wrap" data-selected={selected ? 'true' : undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt ?? ''}
          className="rte-img"
          style={{ width: width ? `${width}px` : undefined }}
          draggable={false}
        />
        {editor.isEditable && selected && (
          <>
            <span className="rte-img-tools" contentEditable={false} onMouseDown={(e) => e.stopPropagation()}>
              <span className="rte-img-row">
                <span className="rte-img-aligns">
                  {alignButtons.map((alignButton) => (
                    <button
                      key={alignButton.value}
                      type="button"
                      className={align === alignButton.value ? 'is-active' : undefined}
                      onClick={() => updateAttributes({ align: alignButton.value })}
                      title={`Align ${alignButton.value}`}
                    >
                      {alignButton.icon}
                    </button>
                  ))}
                </span>
                W
                <input
                  type="number"
                  min={20}
                  value={width ?? ''}
                  placeholder="auto"
                  onChange={(e) => {
                    const typedWidth = parseInt(e.target.value, 10);
                    updateAttributes({ width: Number.isFinite(typedWidth) && typedWidth > 0 ? typedWidth : null });
                  }}
                />
                px
                {shownHeight ? <span className="rte-img-h">× {shownHeight}</span> : null}
                <button type="button" onClick={() => updateAttributes({ width: null })} title="Full size">
                  auto
                </button>
              </span>
              <span className="rte-img-row rte-img-altrow">
                <span className="rte-img-altlabel">Alt</span>
                <input
                  className="rte-img-alt"
                  type="text"
                  value={(node.attrs.alt as string) ?? ''}
                  placeholder="mô tả ảnh cho SEO…"
                  onChange={(e) => updateAttributes({ alt: e.target.value })}
                />
              </span>
            </span>
            <span className="rte-img-handle" onMouseDown={handleResizeStart} title="Drag to resize" />
          </>
        )}
      </span>
    </NodeViewWrapper>
  );
}
