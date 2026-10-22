#!/usr/bin/env node
/**
 * Tạo section mới từ bản mẫu sections/_template, ghi vào registry rồi in các bước còn làm tay.
 * Dùng bởi: `npm run section:new -- <key> [--client]` (key kebab-case = tên thư mục = key registry = key seed).
 * Lưu ý: cắt ghép theo nội dung Example.tsx — sửa bản mẫu thì chạy thử lệnh này rồi `npm run check`.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SECTIONS_DIR = path.join(ROOT, "src/app/(site)/_components/sections");
const TEMPLATE_DIR = path.join(SECTIONS_DIR, "_template");

const key = process.argv[2];
const withClient = process.argv.includes("--client");
if (!key || !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(key)) {
  console.error("Cách dùng: npm run section:new -- <key-kebab-case> [--client]");
  process.exit(1);
}
const pascalName = key
  .split("-")
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join("");
const sectionDir = path.join(SECTIONS_DIR, key);
if (fs.existsSync(sectionDir)) {
  console.error(`Đã có thư mục sections/${key}/ — chọn key khác.`);
  process.exit(1);
}

const renameExample = (source) =>
  source
    .replaceAll("ExampleWidget", `${pascalName}Widget`)
    .replaceAll("ExampleItem", `${pascalName}Item`)
    .replaceAll("Example", pascalName)
    .replaceAll("`example`", `\`${key}\``)
    .replaceAll('"example"', `"${key}"`);

const keepGridLayoutOnly = (source) =>
  source
    .replace(`import { ${pascalName}Widget } from "./${pascalName}Widget.client";\n`, "")
    .replace('import { PHOTO_FRAME } from "@/app/(site)/_components/ui";\n', "")
    .replace(/  resolveImage,\n/, "")
    .replace(/  layoutOf,\n/, "")
    .replace(/const LAYOUTS = .*\n\n/, "")
    .replace(/  const layout = layoutOf\(section, LAYOUTS, "grid"\);\n/, "")
    .replace(/  const image = textOf\(section, "image"\);\n/, "")
    .replace(/\{layout === "split" \? \([\s\S]*?\) : \(\n/, "")
    .replace(/\n      \)\}\n\n      <Note/, "\n\n      <Note")
    .replace(" (bố cục grid) hoặc ảnh + danh sách bấm được (bố cục split)", "")
    .replace("[{title, text, icon}], image, note", "[{title, text, icon}], note");

const addToRegistry = () => {
  const indexPath = path.join(SECTIONS_DIR, "index.ts");
  let index = fs.readFileSync(indexPath, "utf8");
  const eol = index.includes("\r\n") ? "\r\n" : "\n";
  const importLine = `import { ${pascalName} } from "./${key}/${pascalName}";`;
  if (index.includes(importLine)) return;
  const imports = [...index.matchAll(/^import \{ \w+ \} from "\.\/[a-z0-9-]+\/\w+";(?=\r?$)/gm)];
  const lastImport = imports[imports.length - 1];
  const insertAt = lastImport.index + lastImport[0].length;
  index = index.slice(0, insertAt) + eol + importLine + index.slice(insertAt);
  index = index.replace(/(SECTION_COMPONENTS[^{]*\{[\s\S]*?)(\r?\n\};)/, `$1${eol}  "${key}": ${pascalName},$2`);
  index = index.replace(/(export \{\r?\n(?: {2}\w+,\r?\n)+)(\};)/, `$1  ${pascalName},${eol}$2`);
  fs.writeFileSync(indexPath, index);
};

fs.mkdirSync(sectionDir);
const exampleSource = renameExample(fs.readFileSync(path.join(TEMPLATE_DIR, "Example.tsx"), "utf8"));
fs.writeFileSync(
  path.join(sectionDir, `${pascalName}.tsx`),
  withClient ? exampleSource : keepGridLayoutOnly(exampleSource),
);
if (withClient) {
  fs.writeFileSync(
    path.join(sectionDir, `${pascalName}Widget.client.tsx`),
    renameExample(fs.readFileSync(path.join(TEMPLATE_DIR, "ExampleWidget.client.tsx"), "utf8")),
  );
}
execSync(`npx prettier --write "${sectionDir.replace(/\\/g, "/")}"`, { stdio: "ignore" });
addToRegistry();

console.log(`Đã tạo sections/${key}/${pascalName}.tsx${withClient ? ` + ${pascalName}Widget.client.tsx` : ""} và ghi "${key}" vào registry.

Còn lại (làm tay):
  1. Sửa JSX và câu mô tả ở khối đầu ${pascalName}.tsx theo thiết kế — giữ bộ xương Shell → Head → thân → Note.
  2. backend/src/database/seeding/seeds/section-definition.seed.ts: thêm entry
     { pageSlug: 'shared', sectionKey: '${key}', label, description, sortOrder, fields: [...] }
     rồi \`cd backend && npm run db:seed\` (đồng bộ form admin + validate metadata).
  3. Admin: hình phác thảo của component trong page-sections/_components (SKETCHES + SKETCH_BY_KEY['${key}']).
  4. Nội dung: thêm section vào page.seed.ts, \`cd backend && npm run content:export\` để cập nhật cms-fallback.json.
  5. npm run check   (typecheck + lint + lint:layers + lint:sections)`);
