#!/usr/bin/env node
/**
 * lint:sections — kiểm tra thư mục app/(site)/_components/sections/ theo quy định trong sections/README.md (S1–S7 cấu trúc, R1–R3 bộ xương).
 * Dùng bởi: `npm run lint:sections` (nằm trong `npm run check`); thoát mã 1 khi có lỗi, `--no-strict` hạ lỗi R1–R3 xuống cảnh báo.
 * Lưu ý: file chính ghi `// lint-sections-ignore R1: <lý do>` (mỗi quy tắc một dòng) thì quy tắc R đó không tính, lý do được in ra.
 * Quy tắc R và S6 soi code đã bỏ comment; dòng lint-sections-ignore thì đọc trên file gốc.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const SECTIONS = path.join(SRC, "app/(site)/_components/sections");
const STRICT = !process.argv.includes("--no-strict");
const NOT_IN_REGISTRY = new Set(["generic-block"]);

const errors = [];
const warnings = [];
const exceptions = [];
const toRelativePath = (filePath) => path.relative(ROOT, filePath).replace(/\\/g, "/");
const toKebabCase = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const readText = (filePath) => fs.readFileSync(filePath, "utf8");
const stripComments = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

function listSourceFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) listSourceFiles(entryPath, files);
    else if (/\.(tsx?|mjs|css)$/.test(entry.name)) files.push(entryPath);
  }
  return files;
}

const folders = fs
  .readdirSync(SECTIONS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const sectionFolders = folders.filter((folder) => !folder.startsWith("_"));

if (!fs.existsSync(path.join(SECTIONS, "_template/Example.tsx")))
  errors.push("S7  thiếu sections/_template/Example.tsx (bản mẫu cho section mới)");

const mainFiles = new Map();
for (const folder of sectionFolders) {
  const dir = path.join(SECTIONS, folder);
  const files = fs.readdirSync(dir).filter((fileName) => fileName.endsWith(".tsx"));
  const mainCandidates = files.filter((fileName) => !fileName.includes(".") || fileName.split(".").length === 2)
    .filter((fileName) => toKebabCase(fileName.replace(/\.tsx$/, "")) === folder);
  if (mainCandidates.length !== 1) {
    errors.push(
      `S1  ${toRelativePath(dir)}: cần đúng 1 file chính <Pascal>.tsx với kebab(Pascal) = "${folder}" (thấy: ${mainCandidates.join(", ") || "không có"})`,
    );
    continue;
  }
  const pascalName = mainCandidates[0].replace(/\.tsx$/, "");
  mainFiles.set(folder, pascalName);
  const mainPath = path.join(dir, mainCandidates[0]);
  const mainSource = readText(mainPath);

  if (!new RegExp(`export (async )?function ${pascalName}\\(`).test(mainSource))
    errors.push(`S1  ${toRelativePath(mainPath)}: phải \`export function ${pascalName}(\``);
  if (/^\s*["']use client["']/m.test(mainSource))
    errors.push(`S2  ${toRelativePath(mainPath)}: file chính là Server Component, không "use client" (phần tương tác tách ra <Tên>.client.tsx)`);
  if (!mainSource.includes("anchorIdOf("))
    errors.push(`S2  ${toRelativePath(mainPath)}: id của khung phải là anchorIdOf(section, "${folder}")`);
  if (!mainSource.includes('from "../_shared"'))
    errors.push(`S2  ${toRelativePath(mainPath)}: helper lấy từ "../_shared"`);

  const ignoredRules = new Map(
    [...mainSource.matchAll(/lint-sections-ignore (R\d): (.+)/g)].map((match) => [match[1], match[2].trim()]),
  );
  for (const [rule, reason] of ignoredRules) exceptions.push(`${rule}  ${toRelativePath(mainPath)}: ${reason}`);
  const warnUnlessIgnored = (rule, message) => { if (!ignoredRules.has(rule)) warnings.push(`${rule}  ${toRelativePath(mainPath)}: ${message}`); };
  const code = stripComments(mainSource);
  if (!code.includes("<Shell")) warnUnlessIgnored("R1", "chưa dùng <Shell>");
  if (/<section[\s>]/.test(code)) warnUnlessIgnored("R1", "còn <section> viết tay");
  if (!/<(Row)?Head[\s/>]/.test(code)) warnUnlessIgnored("R2", "chưa dùng <Head> (hoặc <RowHead>)");
  if (/<Eyebrow[\s>]/.test(code)) warnUnlessIgnored("R2", "còn <Eyebrow> viết tay (Head đã lo eyebrow + quy tắc ẩn)");
  if (/const pad = |padStart\(2, "0"\)/.test(code)) warnUnlessIgnored("R3", "tự viết số thứ tự 2 chữ số — dùng formatOrdinal từ _shared");

  for (const fileName of files) {
    const filePath = path.join(dir, fileName);
    const source = readText(filePath);
    const isClient = /^\s*["']use client["']/m.test(source);
    const hasClientSuffix = fileName.endsWith(".client.tsx");
    if (isClient && !hasClientSuffix) errors.push(`S3  ${toRelativePath(filePath)}: có "use client" → đặt tên <Tên>.client.tsx`);
    if (!isClient && hasClientSuffix) errors.push(`S3  ${toRelativePath(filePath)}: tên .client.tsx nhưng thiếu "use client"`);
    if (/\.metadata\b/.test(stripComments(source)))
      errors.push(`S6  ${toRelativePath(filePath)}: đọc .metadata trực tiếp — dùng textOf/textListOf/itemsOf/metaOf`);
    for (const match of source.matchAll(/from ["']([^"']+)["']/g)) {
      const importPath = match[1];
      if (/^\.\.\/(?!_shared)/.test(importPath))
        errors.push(`S4  ${toRelativePath(filePath)}: import "${importPath}" — không import chéo giữa các section (chỉ ./ hoặc ../_shared)`);
      if (importPath.includes("_components/sections/") && !importPath.endsWith("/sections"))
        errors.push(`S4  ${toRelativePath(filePath)}: import "${importPath}" — không trỏ thẳng vào thư mục section khác`);
    }
  }
}

const allSourceFiles = listSourceFiles(SRC).filter((filePath) => /\.tsx?$/.test(filePath));
for (const folder of sectionFolders) {
  const dir = path.join(SECTIONS, folder);
  for (const fileName of fs.readdirSync(dir).filter((name) => name.endsWith(".client.tsx"))) {
    const moduleName = fileName.replace(/\.tsx$/, "");
    for (const filePath of allSourceFiles) {
      if (filePath.startsWith(dir + path.sep)) continue;
      if (readText(filePath).includes(`/${moduleName}"`) || readText(filePath).includes(`/${moduleName}'`))
        errors.push(`S4  ${toRelativePath(filePath)}: import ${moduleName} — file .client.tsx chỉ dùng trong ${toRelativePath(dir)}`);
    }
  }
}

const indexSource = readText(path.join(SECTIONS, "index.ts"));
const registryBlock = indexSource.match(/SECTION_COMPONENTS[^{]*\{([\s\S]*?)\n\};/);
if (!registryBlock) errors.push("S5  không tìm thấy SECTION_COMPONENTS trong sections/index.ts");
else {
  const registryKeys = [...registryBlock[1].matchAll(/^\s*"?([a-z0-9-]+)"?\s*:/gm)].map((match) => match[1]);
  for (const key of registryKeys)
    if (!sectionFolders.includes(key)) errors.push(`S5  registry có "${key}" nhưng không có thư mục sections/${key}/`);
  for (const folder of sectionFolders)
    if (!registryKeys.includes(folder) && !NOT_IN_REGISTRY.has(folder)) errors.push(`S5  thư mục sections/${folder}/ chưa có trong SECTION_COMPONENTS (index.ts)`);
  for (const [folder, pascalName] of mainFiles)
    if (!NOT_IN_REGISTRY.has(folder) && !indexSource.includes(`from "./${folder}/${pascalName}"`))
      errors.push(`S5  index.ts: import ${pascalName} phải là "./${folder}/${pascalName}"`);
}

const foldersOnSkeleton = [...mainFiles.keys()].filter(
  (folder) => !warnings.some((warning) => warning.includes(`/sections/${folder}/`)),
);
console.log(
  `lint:sections — ${sectionFolders.length} section, ${foldersOnSkeleton.length} đã theo bộ xương Shell/Head` +
    (foldersOnSkeleton.length ? ` (${foldersOnSkeleton.join(", ")})` : ""),
);
if (exceptions.length) {
  console.log(`\nNgoại lệ có lý do (${exceptions.length}):`);
  for (const exception of exceptions) console.log("  " + exception);
}
if (warnings.length) {
  console[STRICT ? "error" : "warn"](`\n${STRICT ? "LỖI" : "Cảnh báo"} bộ xương (${warnings.length}) — sửa theo sections/README.md mục 3, hoặc khai ngoại lệ có lý do:`);
  for (const warning of warnings) console[STRICT ? "error" : "warn"]("  " + warning);
}
if (errors.length) {
  console.error(`\nLỖI cấu trúc (${errors.length}):`);
  for (const error of errors) console.error("  " + error);
}
const hasFailed = errors.length > 0 || (STRICT && warnings.length > 0);
if (!hasFailed) console.log("Cấu trúc thư mục sections/ đúng quy định.");
process.exit(hasFailed ? 1 : 0);
