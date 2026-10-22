/**
 * Cắt cùng một dải ngang của hai ảnh (trước / sau) rồi ghép cạnh nhau để xem nhanh chỗ khác.
 * Dùng bởi: chạy tay `node scripts/crop-png.mjs <A.png> <B.png> <y> <h> <out.png> [scale=0.5]` khi so ảnh refactor.
 */
import sharp from "sharp";

const [beforePath, afterPath, topArg, heightArg, outPath, scaleArg] = process.argv.slice(2);
if (!beforePath || !afterPath || !topArg || !heightArg || !outPath) {
  console.error("Cách dùng: node scripts/crop-png.mjs A.png B.png y h out.png [scale]");
  process.exit(1);
}
const top = Number(topArg), height = Number(heightArg), scale = Number(scaleArg ?? 0.5);
const metadata = await sharp(beforePath).metadata();
const width = metadata.width;
const cropBand = (imagePath) =>
  sharp(imagePath).extract({ left: 0, top, width, height: Math.min(height, metadata.height - top) })
    .resize(Math.round(width * scale)).png().toBuffer();
const [beforeBand, afterBand] = await Promise.all([cropBand(beforePath), cropBand(afterPath)]);
const bandWidth = Math.round(width * scale), bandHeight = Math.round(Math.min(height, metadata.height - top) * scale);
await sharp({ create: { width: bandWidth * 2 + 16, height: bandHeight, channels: 4, background: "#ff0000" } })
  .composite([{ input: beforeBand, left: 0, top: 0 }, { input: afterBand, left: bandWidth + 16, top: 0 }])
  .png().toFile(outPath);
console.log(`wrote ${outPath} (${bandWidth * 2 + 16}x${bandHeight})`);
