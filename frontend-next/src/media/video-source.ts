/**
 * Nhận diện video trong CMS: file upload (uploads/videos/...) hay link YouTube / Vimeo, đổi link sang URL nhúng, đoán hướng (Shorts → dọc).
 * Dùng bởi: admin generic-form/VideoInput.tsx, rich-text-editor/RichTextEditor.tsx, rich-text-editor/VideoNode.tsx.
 * Lưu ý: link host khác YouTube / Vimeo thì toEmbedUrl trả null (không nhúng).
 */
export type VideoOrientation = "landscape" | "portrait";
export type VideoProvider = "file" | "youtube" | "vimeo";

export function isExternalVideo(value: string): boolean {
  return /^https?:\/\//i.test(value) && !/\/uploads\//i.test(value);
}

export function toEmbedUrl(link: string): string | null {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const shortOrEmbedMatch = url.pathname.match(/^\/(?:shorts|embed)\/([^/?]+)/);
    const id = shortOrEmbedMatch?.[1] ?? url.searchParams.get("v");
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.match(/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

export function videoProviderOf(value: string): VideoProvider {
  if (!isExternalVideo(value)) return "file";
  return /vimeo\.com/i.test(value) ? "vimeo" : "youtube";
}

export function guessOrientation(value: string, fallback: VideoOrientation = "landscape"): VideoOrientation {
  return /\/shorts\//i.test(value) ? "portrait" : fallback;
}
