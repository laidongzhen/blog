/**
 * 文档快捷提交：暂存 docs 改动 → 按文档生成提交说明 → 确认/改写 → git commit
 * 用法：pnpm run docs:commit  或双击仓库根目录 docs-commit.cmd
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function toPosix(p) {
  return p.replace(/\\/g, "/");
}

function git(args, opts = {}) {
  return execFileSync("git", ["-c", "core.quotepath=false", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...opts,
  }).trimEnd();
}

function gitOk(args) {
  try {
    git(args);
    return true;
  } catch {
    return false;
  }
}

function ask(question) {
  if (!process.stdin.isTTY) {
    console.error("需要交互终端（请双击 docs-commit.cmd，或在终端运行 pnpm run docs:commit）。");
    process.exit(1);
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** porcelain: XY path，重命名时 path 为 "old -> new" */
function parseStatus() {
  let out = "";
  try {
    out = git(["status", "--porcelain", "-u"]);
  } catch {
    console.error("无法读取 git status（确认在仓库根目录）。");
    process.exit(1);
  }
  const rows = [];
  for (const line of out.split("\n").filter(Boolean)) {
    const xy = line.slice(0, 2);
    let rest = line.slice(3);
    // 去掉 Git 可能加的引号
    if (rest.startsWith('"') && rest.endsWith('"')) rest = rest.slice(1, -1);
    let file = rest;
    if (rest.includes(" -> ")) file = rest.split(" -> ").pop();
    rows.push({ xy, file: toPosix(file), raw: rest });
  }
  return rows;
}

function isDocsPath(rel) {
  return rel === "docs" || rel.startsWith("docs/");
}

function isDocsMd(rel) {
  return isDocsPath(rel) && rel.toLowerCase().endsWith(".md");
}

/** 文章名：优先 frontmatter title，其次首个 # 标题，否则用文件名 */
function docDisplayName(relPosix) {
  const abs = path.join(ROOT, relPosix);
  const base = path.basename(relPosix, path.extname(relPosix));
  if (base.toLowerCase() === "index") {
    const parent = path.basename(path.dirname(relPosix));
    return parent === "docs" ? "文档首页" : parent;
  }
  if (!fs.existsSync(abs)) return base;
  let text = "";
  try {
    text = fs.readFileSync(abs, "utf8");
  } catch {
    return base;
  }
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const title = fm[1].match(/^title:\s*(.+)$/m);
    if (title) {
      let t = title[1].trim();
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        t = t.slice(1, -1);
      }
      if (t) return t;
    }
  }
  const h1 = text.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();
  return base;
}

function classifyDocsMd(rows) {
  const added = [];
  const updated = [];
  const deleted = [];
  for (const { xy, file } of rows) {
    if (!isDocsMd(file)) continue;
    const staged = xy[0];
    const unstaged = xy[1];
    const code = staged !== " " && staged !== "?" ? staged : unstaged;
    if (code === "A" || code === "?" || code === "C") added.push(file);
    else if (code === "D") deleted.push(file);
    else updated.push(file);
  }
  return { added, updated, deleted };
}

function buildMessage({ added, updated, deleted }) {
  const parts = [];
  const names = (files) =>
    [...new Set(files.map(docDisplayName))].filter(Boolean).join("、");

  if (added.length) parts.push(`新增${names(added)}`);
  if (updated.length) parts.push(`更新${names(updated)}`);
  if (deleted.length) parts.push(`删除${names(deleted)}`);

  if (!parts.length) return "docs: 更新文档";
  return `docs: ${parts.join("，")}`;
}

/** 配图目录：与 md 同名的文件夹 */
function companionDirs(mdRel) {
  const dir = mdRel.replace(/\.md$/i, "");
  const abs = path.join(ROOT, dir);
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) return [dir];
  return [];
}

function stageDocs(rows) {
  const toAdd = new Set();
  for (const { file } of rows) {
    if (!isDocsPath(file)) continue;
    toAdd.add(file);
    if (isDocsMd(file)) {
      for (const d of companionDirs(file)) toAdd.add(d);
    }
  }
  if (!toAdd.size) return [];
  const list = [...toAdd];
  git(["add", "--", ...list]);
  return list;
}

async function main() {
  if (!gitOk(["rev-parse", "--is-inside-work-tree"])) {
    console.error("当前目录不是 git 仓库。");
    process.exit(1);
  }

  console.log("—— 当前改动 ——");
  try {
    const st = git(["status", "-sb"]);
    console.log(st || "(工作区干净)");
  } catch {
    /* ignore */
  }
  console.log("");

  const rows = parseStatus();
  if (!rows.length) {
    console.log("没有可提交的改动。");
    process.exit(0);
  }

  const docsRows = rows.filter((r) => isDocsPath(r.file));
  const otherRows = rows.filter((r) => !isDocsPath(r.file));

  if (docsRows.length) {
    const staged = stageDocs(docsRows);
    console.log("已暂存 docs 相关：");
    for (const f of staged) console.log(`  + ${f}`);
    console.log("");
  } else {
    console.log("没有 docs/ 下的改动。");
  }

  if (otherRows.length) {
    console.log("另有非文档改动：");
    for (const r of otherRows) console.log(`  ${r.xy} ${r.file}`);
    const ans = await ask("是否一并暂存这些文件？[y/N] ");
    if (/^y(es)?$/i.test(ans)) {
      git(["add", "--", ...otherRows.map((r) => r.file)]);
      console.log("已暂存上述非文档文件。\n");
    } else {
      console.log("已跳过非文档文件。\n");
    }
  }

  let cached = "";
  try {
    cached = git(["diff", "--cached", "--name-only"]);
  } catch {
    cached = "";
  }
  if (!cached.trim()) {
    console.log("暂存区为空，取消提交。");
    process.exit(0);
  }

  console.log("—— 本次将提交 ——");
  console.log(cached);
  console.log("");

  console.log("—— 校验暂存文档（必做）——\n");
  try {
    execFileSync("pnpm", ["run", "docs:check"], {
      cwd: ROOT,
      stdio: "inherit",
      shell: true,
    });
  } catch {
    console.error("\n校验未通过，已中止。按提示改 md 后重新 git add，再运行本脚本。");
    process.exit(1);
  }
  console.log("");

  // 用暂存后的状态重新分类，生成说明
  const after = parseStatus().filter((r) => {
    const s = r.xy[0];
    return s !== " " && s !== "?";
  });
  let message = buildMessage(classifyDocsMd(after.length ? after : docsRows));

  // 若暂存里几乎没有 md，用文件名兜底
  if (message === "docs: 更新文档") {
    const names = cached
      .split("\n")
      .filter(Boolean)
      .map((f) => path.basename(f))
      .slice(0, 5);
    if (names.length) message = `chore: 更新 ${names.join("、")}`;
  }

  console.log(`建议提交说明：\n  ${message}\n`);
  console.log("直接回车 = 用上面的说明提交");
  console.log("输入新说明 = 用你的说明提交");
  console.log("输入 q = 取消\n");

  const input = await ask("确认或改写 > ");
  if (/^q(uit)?$/i.test(input)) {
    console.log("已取消。");
    process.exit(0);
  }
  if (input) message = input;

  const tmp = path.join(os.tmpdir(), `blog-commit-msg-${process.pid}.txt`);
  fs.writeFileSync(tmp, message + "\n", "utf8");

  console.log("\n正在提交（pre-commit 会再跑 docs:check）…\n");
  try {
    execFileSync("git", ["-c", "core.quotepath=false", "commit", "-F", tmp], {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, GIT_EDITOR: "true" },
    });
  } catch {
    console.error("\n提交失败（可能是校验未通过或无有效改动）。改完后重新运行本脚本。");
    process.exitCode = 1;
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }

  console.log("\n—— 提交后状态 ——");
  try {
    console.log(git(["status", "-sb"]));
  } catch {
    /* ignore */
  }
  console.log("\n需要发布到站点时再执行：git push");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
