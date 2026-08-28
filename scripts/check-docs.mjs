import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");

const TAG_RE = /<\/?(script|style|template)\b/gi;
const MUSTACHE_RE = /\{\{/g;

function isDocsMd(relPosix) {
  return relPosix.startsWith("docs/") && relPosix.toLowerCase().endsWith(".md");
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function walkDocsMd(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walkDocsMd(abs, acc);
    else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) acc.push(abs);
  }
  return acc;
}

function stagedDocsMd() {
  let out = "";
  try {
    out = execSync("git diff --cached --name-only --diff-filter=ACMR -z", {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch {
    console.error("无法读取暂存区（确认在 git 仓库里执行）。");
    process.exit(1);
  }
  return out
    .split("\0")
    .filter(Boolean)
    .map((f) => toPosix(f))
    .filter(isDocsMd)
    .map((f) => path.join(ROOT, f));
}

function checkFile(abs) {
  const rel = toPosix(path.relative(ROOT, abs));
  const content = fs.readFileSync(abs, "utf8").replace(/^\uFEFF/, "");
  const lines = content.split(/\n/);
  const issues = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, "");
    const trimmed = line.trimStart();
    if (trimmed.startsWith("```") || trimmed.startsWith("~~~")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    TAG_RE.lastIndex = 0;
    let m;
    while ((m = TAG_RE.exec(line))) {
      issues.push({
        rel,
        line: i + 1,
        col: m.index + 1,
        kind: "tag",
        text: m[0],
      });
    }

    MUSTACHE_RE.lastIndex = 0;
    while ((m = MUSTACHE_RE.exec(line))) {
      issues.push({
        rel,
        line: i + 1,
        col: m.index + 1,
        kind: "mustache",
        text: "{{",
      });
    }
  }

  return issues;
}

function advise(issue) {
  if (issue.kind === "tag") {
    return [
      `问题: 裸写 ${issue.text}，VitePress 会当成 Vue 真标签，正文可能整页空白。`,
      `建议: 改成「${issue.text.replace(/[<>/]/g, "")}」这类文字；Vue 示例放进三反引号代码块。不要在表格、行内反引号或正文里打完整尖括号标签。`,
    ];
  }
  return [
    "问题: 裸写 {{ }}，VitePress 会当成 Vue 插值，变量不存在时正文空白。",
    "建议: 改成普通文字说明，或放进三反引号代码块。GitHub Actions 表达式不要在正文里连着写双花括号。",
  ];
}

function parseArgs(argv) {
  const staged = argv.includes("--staged");
  const files = argv.filter((a) => a !== "--staged");
  return { staged, files };
}

const { staged, files } = parseArgs(process.argv.slice(2));

let targets = [];
if (files.length) {
  targets = files.map((f) =>
    path.isAbsolute(f) ? f : path.join(process.cwd(), f)
  );
} else if (staged) {
  targets = stagedDocsMd();
} else {
  targets = walkDocsMd(DOCS);
}

targets = [...new Set(targets.filter((abs) => fs.existsSync(abs)))];

if (staged && targets.length === 0) {
  console.log("暂存区没有 docs 下的 Markdown，跳过文档校验。");
  process.exit(0);
}

const issues = targets.flatMap(checkFile);

if (issues.length === 0) {
  const n = targets.length;
  console.log(
    staged
      ? `文档校验通过（${n} 篇暂存 md）。`
      : `文档校验通过（${n} 篇）。`
  );
  process.exit(0);
}

console.error("文档校验未通过：VitePress 会把 Markdown 当 Vue 模板编译，下面这些写法会导致正文空白。\n");
for (const issue of issues) {
  console.error(`${issue.rel}:${issue.line}:${issue.col}`);
  for (const line of advise(issue)) console.error(`  ${line}`);
  console.error("");
}
console.error(
  `共 ${issues.length} 处。改完后再提交。说明见 书写注意事项.md「侧栏在、正文空白」。`
);
process.exit(1);
