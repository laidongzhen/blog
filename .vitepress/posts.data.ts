import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface PostItem {
  title: string;
  url: string;
  date: string;
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(ROOT, "docs");

function parseDoc(content: string, fallback: string) {
  const text = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  let hidden = false;
  let title = "";
  let body = text;

  if (text.startsWith("---")) {
    const end = text.indexOf("\n---", 3);
    if (end !== -1) {
      const yaml = text.slice(3, end);
      body = text.slice(end + 4);
      if (/^hidden:\s*true\s*$/m.test(yaml)) hidden = true;
      const titleMatch = yaml.match(/^title:\s*["']?(.+?)["']?\s*$/m);
      if (titleMatch) title = titleMatch[1].trim();
    }
  }

  if (!title) {
    const h1 = body.match(/^#\s+(.+)$/m);
    title = h1?.[1]?.trim() || fallback;
  }

  return { title, hidden };
}

function gitDates() {
  const map = new Map<string, string>();
  try {
    const out = execFileSync(
      "git",
      [
        "-c",
        "core.quotepath=false",
        "log",
        "--pretty=format:%cI",
        "--name-only",
        "--",
        "docs",
      ],
      { cwd: ROOT, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
    );
    let current = "";
    for (const raw of out.split(/\r?\n/)) {
      const line = raw.trim().replace(/^"|"$/g, "");
      if (!line) continue;
      if (/^\d{4}-\d{2}-\d{2}T/.test(line)) {
        current = line;
        continue;
      }
      const rel = line.replace(/\\/g, "/");
      if (current && !map.has(rel)) map.set(rel, current);
    }
  } catch {
    // 没有 git 历史时改用文件修改时间
  }
  return map;
}

function loadPosts(files: string[]): PostItem[] {
  const dates = gitDates();
  const posts: Array<PostItem & { stamp: string }> = [];

  for (const file of files) {
    const relFromDocs = path.relative(DOCS, file).replace(/\\/g, "/");
    if (!relFromDocs || relFromDocs.startsWith("..")) continue;
    if (path.basename(file) === "index.md" || path.basename(file).startsWith("_")) {
      continue;
    }

    const { title, hidden } = parseDoc(
      fs.readFileSync(file, "utf8"),
      path.basename(file, ".md")
    );
    if (hidden) continue;

    const rel = `docs/${relFromDocs}`;
    const stamp = dates.get(rel) || fs.statSync(file).mtime.toISOString();
    posts.push({
      title,
      url: `/${relFromDocs.replace(/\.md$/, "")}`,
      date: stamp.slice(0, 10),
      stamp,
    });
  }

  posts.sort((a, b) => (a.stamp < b.stamp ? 1 : a.stamp > b.stamp ? -1 : 0));
  return posts.slice(0, 3).map(({ title, url, date }) => ({ title, url, date }));
}

export default {
  watch: ["../docs/**/*.md"],
  load(watchedFiles: string[]) {
    return loadPosts(watchedFiles);
  },
};

declare const data: PostItem[];
export { data };
