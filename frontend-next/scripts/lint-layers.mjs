#!/usr/bin/env node
/**
 * lint:layers — bắt class Tailwind bị CASCADE LAYER `effects` (styles/effects.css, đặt SAU utilities) nuốt im lặng, và hậu tố `!` thừa.
 * Dùng bởi: `npm run lint:layers` (nằm trong `npm run check`); thoát mã 1 nếu có phát hiện.
 * Lưu ý: đọc effects.css (bỏ comment), lấy thuộc tính mà rule theo class móc (`.reveal`…) đặt, rồi dò className trong src/app/(site).
 * Chỉ đọc chuỗi class viết thẳng trong className / cn(...), không lần theo hằng số (PHOTO_FRAME…), không biết phần tử nào là CON
 * của `.reveal-group` — đừng đặt opacity / transform / transition lên con trực tiếp của nó. Kiến trúc layer: src/styles/tailwind.css.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIR = path.join(ROOT, "src/app/(site)");
const EFFECTS_CSS = path.join(ROOT, "src/styles/effects.css");

const PROPERTY_UTILITY_PREFIXES = [
  [/^opacity$/, /^opacity-/],
  [/^transform$/, /^\[transform:/],
  [/^transition(-[a-z]+)?$/, /^(transition|duration-|ease-|delay-)/],
  [/^animation(-[a-z]+)?$/, /^animate-/],
];

function readSwallowingHooks() {
  const css = fs
    .readFileSync(EFFECTS_CSS, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
  const hookPrefixes = new Map();
  for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const properties = rule[2]
      .split(";")
      .map((declaration) => declaration.split(":")[0].trim().toLowerCase())
      .filter(Boolean);
    const prefixes = PROPERTY_UTILITY_PREFIXES.filter(([propertyPattern]) =>
      properties.some((property) => propertyPattern.test(property)),
    ).map(([, utilityPattern]) => utilityPattern);
    if (!prefixes.length) continue;
    for (const selector of rule[1].trim().replace(/^@media[^{]*/, "").split(/,(?![^(]*\))/)) {
      const targetCompound =
        selector
          .trim()
          .split(/\s+|>|\+|~/)
          .filter(Boolean)
          .pop() ?? "";
      if (targetCompound.includes("::") || targetCompound.startsWith(":is(")) continue;
      for (const classMatch of targetCompound.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
        const hookClass = classMatch[1];
        if (hookClass === "is-visible") continue;
        if (!hookPrefixes.has(hookClass)) hookPrefixes.set(hookClass, new Set());
        for (const prefix of prefixes) hookPrefixes.get(hookClass).add(prefix);
      }
    }
  }
  return hookPrefixes;
}

function listTsxFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) listTsxFiles(entryPath, files);
    else if (entry.name.endsWith(".tsx")) files.push(entryPath);
  }
  return files;
}

function extractClassNames(expression) {
  const classNames = [];
  for (const stringMatch of expression.matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)) {
    const text = stringMatch[1] ?? stringMatch[2] ?? stringMatch[3] ?? "";
    if (text.includes("${")) continue;
    let depth = 0,
      current = "";
    for (const char of text) {
      if (char === "[" || char === "(") depth++;
      else if (char === "]" || char === ")") depth--;
      if (/\s/.test(char) && depth === 0) {
        if (current) {
          classNames.push(current);
          current = "";
        }
      } else current += char;
    }
    if (current) classNames.push(current);
  }
  return classNames;
}

const hookPrefixes = readSwallowingHooks();
const findings = [];

for (const file of listTsxFiles(SCAN_DIR)) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(
    /className=(?:("(?:[^"]*)")|\{`(?:[^`]*)`\}|\{cn\(([\s\S]*?)\)\})/g,
  )) {
    const classNames = extractClassNames(match[0].slice("className=".length));
    const swallowedPrefixes = new Set();
    for (const className of classNames)
      for (const prefix of hookPrefixes.get(className) ?? []) swallowedPrefixes.add(prefix);

    const line = source.slice(0, match.index).split("\n").length;
    const relativePath = path.relative(ROOT, file);
    for (const className of classNames) {
      if (className.endsWith("!")) {
        findings.push(`${relativePath}:${line}  [THỪA  !]  ${className}  — bỏ dấu ! đi`);
        continue;
      }
      const bareClass = className.replace(/^(?:[^:\s[]+:|\[[^\]]*\]:)+/, "");
      if ([...swallowedPrefixes].some((prefix) => prefix.test(bareClass))) {
        findings.push(
          `${relativePath}:${line}  [BỊ NUỐT]  ${className}  — effects.css đè thuộc tính này trên phần tử`,
        );
      }
    }
  }
}

if (!findings.length) {
  console.log("lint:layers — sạch, không có class Tailwind nào bị nuốt im lặng.");
  process.exit(0);
}
console.error(`lint:layers — ${findings.length} phát hiện:\n`);
for (const finding of findings) console.error("  " + finding);
console.error(`
Cách sửa [BỊ NUỐT]: chuyển class đó lên phần tử con (VD bọc nội dung thẻ), hoặc
bỏ đi nếu hiệu ứng hiện dần đã lo phần chuyển động.
Giải thích đầy đủ: frontend-next/scripts/README.md`);
process.exit(1);
