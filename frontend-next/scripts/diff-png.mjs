/**
 * So hai thư mục ảnh PNG (từ scripts/shot-pages.mjs) theo từng pixel, in số pixel khác cho từng file, thoát mã 1 nếu có file khác.
 * Dùng bởi: lệnh `npm run diff:png -- <dir-A> <dir-B> [--out <dir>] [--noise <dir1,dir2>]` khi so ảnh trước / sau refactor.
 * Lưu ý: --noise là các lần chụp CÙNG mã nguồn với A; hàng pixel khác giữa chúng (marquee, vòng xoay…) bị bỏ qua khi so A với B
 * và được in ra. 48 hàng cuối ảnh luôn bỏ (mép dưới hay lệch vài pixel). Dùng `sharp` có sẵn trong node_modules của Next.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const argv = process.argv.slice(2);
const readOption = (name) => {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
};
const [dirA, dirB] = argv.filter((arg, index) => !arg.startsWith("--") && (index === 0 || !argv[index - 1].startsWith("--")));
const diffDir = readOption("--out");
const noiseDirs = (readOption("--noise") ?? "").split(",").filter(Boolean);
const EDGE_ROWS = 48;
const BAND_MERGE_GAP = 24;

if (!dirA || !dirB) {
  console.error("Cách dùng: node scripts/diff-png.mjs <dir-A> <dir-B> [--out dir] [--noise dir1,dir2]");
  process.exit(1);
}
if (diffDir) fs.mkdirSync(diffDir, { recursive: true });

const readRawPixels = (file) => sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

function findDifferentRows(pixelsA, pixelsB, width, height) {
  const rows = new Uint8Array(height);
  for (let y = 0; y < height; y++) {
    const start = y * width * 4;
    const end = start + width * 4;
    for (let offset = start; offset < end; offset += 4) {
      if (pixelsA[offset] !== pixelsB[offset] || pixelsA[offset + 1] !== pixelsB[offset + 1] || pixelsA[offset + 2] !== pixelsB[offset + 2]) {
        rows[y] = 1;
        break;
      }
    }
  }
  return rows;
}

function groupRowsIntoBands(rows) {
  const bands = [];
  let start = -1;
  for (let y = 0; y <= rows.length; y++) {
    const isMarked = y < rows.length && rows[y];
    if (isMarked && start < 0) start = y;
    if (!isMarked && start >= 0) {
      const lastBand = bands[bands.length - 1];
      if (lastBand && y - lastBand[1] < BAND_MERGE_GAP) lastBand[1] = y - 1;
      else bands.push([start, y - 1]);
      start = -1;
    }
  }
  return bands;
}

const fileNames = fs.readdirSync(dirA).filter((fileName) => fileName.endsWith(".png")).sort();
let failedCount = 0;
for (const fileName of fileNames) {
  const fileB = path.join(dirB, fileName);
  if (!fs.existsSync(fileB)) {
    console.log(`THIẾU  ${fileName} (không có trong B)`);
    failedCount++;
    continue;
  }
  const imageA = await readRawPixels(path.join(dirA, fileName));
  const imageB = await readRawPixels(fileB);
  if (imageA.info.width !== imageB.info.width || imageA.info.height !== imageB.info.height) {
    console.log(`KHÁC   ${fileName}: kích thước ${imageA.info.width}x${imageA.info.height} vs ${imageB.info.width}x${imageB.info.height}`);
    failedCount++;
    continue;
  }
  const { width, height } = imageA.info;

  const noisyRows = new Uint8Array(height);
  for (const dir of noiseDirs) {
    const noiseFile = path.join(dir, fileName);
    if (!fs.existsSync(noiseFile)) continue;
    const noiseImage = await readRawPixels(noiseFile);
    if (noiseImage.info.width !== width || noiseImage.info.height !== height) continue;
    const changedRows = findDifferentRows(imageA.data, noiseImage.data, width, height);
    for (let y = 0; y < height; y++) if (changedRows[y]) noisyRows[y] = 1;
  }
  for (let y = Math.max(0, height - EDGE_ROWS); y < height; y++) noisyRows[y] = 1;
  const noiseBands = groupRowsIntoBands(noisyRows);
  const skipRow = new Uint8Array(height);
  for (const [bandStart, bandEnd] of noiseBands) for (let y = bandStart; y <= bandEnd; y++) skipRow[y] = 1;

  let diffPixelCount = 0;
  let minY = height, maxY = -1;
  const markedPixels = diffDir ? Buffer.from(imageB.data) : null;
  for (let y = 0; y < height; y++) {
    if (skipRow[y]) continue;
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      if (imageA.data[offset] !== imageB.data[offset] || imageA.data[offset + 1] !== imageB.data[offset + 1] || imageA.data[offset + 2] !== imageB.data[offset + 2]) {
        diffPixelCount++;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (markedPixels) { markedPixels[offset] = 255; markedPixels[offset + 1] = 0; markedPixels[offset + 2] = 0; markedPixels[offset + 3] = 255; }
      }
    }
  }
  const skippedBands = noiseBands.filter(([bandStart]) => bandStart < height - EDGE_ROWS).map(([bandStart, bandEnd]) => `${bandStart}–${bandEnd}`).join(", ");
  const note = skippedBands ? `  (bỏ qua dải nhiễu hàng ${skippedBands})` : "";
  if (diffPixelCount === 0) console.log(`giống  ${fileName}${note}`);
  else {
    failedCount++;
    console.log(`KHÁC   ${fileName}: ${diffPixelCount} pixel, hàng ${minY}–${maxY}${note}`);
    if (markedPixels) await sharp(markedPixels, { raw: { width, height, channels: 4 } }).png().toFile(path.join(diffDir, fileName));
  }
}
process.exit(failedCount ? 1 : 0);
