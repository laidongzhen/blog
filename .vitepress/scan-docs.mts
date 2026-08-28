import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DefaultTheme } from "vitepress";

const DOCS_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../docs"
);

type FileMeta = {
  hidden?: boolean;
  title?: string;
  order?: number;
  collapsed?: boolean;
};

type ParsedMd = {
  meta: FileMeta;
  h1?: string;
};

function parseMdFile(filePath: string): ParsedMd {
  const content = fs
    .readFileSync(filePath, "utf8")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
  const meta: FileMeta = {};
  let body = content;

  if (content.startsWith("---")) {
    const end = content.indexOf("\n---", 3);
    if (end !== -1) {
      const yaml = content.slice(3, end);
      body = content.slice(end + 4);
      if (/^hidden:\s*true\s*$/m.test(yaml)) meta.hidden = true;
      const titleMatch = yaml.match(/^title:\s*["']?(.+?)["']?\s*$/m);
      if (titleMatch) meta.title = titleMatch[1].trim();
      const orderMatch = yaml.match(/^order:\s*(-?\d+)\s*$/m);
      if (orderMatch) meta.order = Number(orderMatch[1]);
      if (/^collapsed:\s*false\s*$/m.test(yaml)) meta.collapsed = false;
      if (/^collapsed:\s*true\s*$/m.test(yaml)) meta.collapsed = true;
    }
  }

  const h1Match = body.match(/^#\s+(.+)$/m);
  return { meta, h1: h1Match?.[1]?.trim() };
}

function groupCollapsed(meta: FileMeta): boolean {
  return meta.collapsed !== false;
}

function displayName(parsed: ParsedMd, fallback: string) {
  return parsed.meta.title || parsed.h1 || fallback;
}

function compareNodes(
  a: { order: number; sortName: string },
  b: { order: number; sortName: string }
) {
  if (a.order !== b.order) return a.order - b.order;
  return a.sortName.localeCompare(b.sortName, "zh");
}

function scanDir(
  absDir: string,
  urlPrefix: string
): DefaultTheme.SidebarItem[] {
  if (!fs.existsSync(absDir)) return [];

  const nodes: Array<{
    order: number;
    sortName: string;
    item: DefaultTheme.SidebarItem;
  }> = [];

  for (const ent of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (ent.name.startsWith("_") || ent.name === "README.md") continue;

    if (ent.isDirectory()) {
      const childAbs = path.join(absDir, ent.name);
      const childUrl = `${urlPrefix}/${ent.name}`;
      const indexAbs = path.join(childAbs, "index.md");
      const hasIndex = fs.existsSync(indexAbs);

      let order = Number.POSITIVE_INFINITY;
      let text = ent.name;
      let collapsed = true;

      if (hasIndex) {
        const parsed = parseMdFile(indexAbs);
        if (parsed.meta.hidden) continue;
        order = parsed.meta.order ?? Number.POSITIVE_INFINITY;
        text = displayName(parsed, ent.name);
        collapsed = groupCollapsed(parsed.meta);
      }

      const childItems = scanDir(childAbs, childUrl);
      if (!hasIndex && childItems.length === 0) continue;

      if (hasIndex && childItems.length === 0) {
        nodes.push({
          order,
          sortName: ent.name,
          item: { text, link: `${childUrl}/` },
        });
      } else if (hasIndex) {
        nodes.push({
          order,
          sortName: ent.name,
          item: {
            text,
            link: `${childUrl}/`,
            collapsed,
            items: childItems,
          },
        });
      } else {
        nodes.push({
          order,
          sortName: ent.name,
          item: { text: ent.name, collapsed: true, items: childItems },
        });
      }
      continue;
    }

    if (!ent.isFile() || !ent.name.endsWith(".md") || ent.name === "index.md") {
      continue;
    }

    const abs = path.join(absDir, ent.name);
    const parsed = parseMdFile(abs);
    if (parsed.meta.hidden) continue;

    const stem = ent.name.slice(0, -3);
    nodes.push({
      order: parsed.meta.order ?? Number.POSITIVE_INFINITY,
      sortName: ent.name,
      item: {
        text: displayName(parsed, stem),
        link: `${urlPrefix}/${stem}`,
      },
    });
  }

  nodes.sort(compareNodes);
  return nodes.map((node) => node.item);
}

export function scanNav(): DefaultTheme.NavItem[] {
  const nav: DefaultTheme.NavItem[] = [{ text: "首页", link: "/" }];
  if (!fs.existsSync(DOCS_ROOT)) return nav;

  const items: Array<{
    order: number;
    sortName: string;
    item: DefaultTheme.NavItem;
  }> = [];

  for (const ent of fs.readdirSync(DOCS_ROOT, { withFileTypes: true })) {
    if (!ent.isDirectory() || ent.name.startsWith("_")) continue;

    const indexAbs = path.join(DOCS_ROOT, ent.name, "index.md");
    if (!fs.existsSync(indexAbs)) continue;

    const parsed = parseMdFile(indexAbs);
    if (parsed.meta.hidden) continue;

    items.push({
      order: parsed.meta.order ?? Number.POSITIVE_INFINITY,
      sortName: ent.name,
      item: {
        text: displayName(parsed, ent.name),
        link: `/${ent.name}/`,
      },
    });
  }

  items.sort(compareNodes);
  return [...nav, ...items.map((item) => item.item)];
}

export function scanSidebar(): DefaultTheme.Sidebar {
  const sidebar: DefaultTheme.SidebarMulti = {};
  if (!fs.existsSync(DOCS_ROOT)) return sidebar;

  for (const ent of fs.readdirSync(DOCS_ROOT, { withFileTypes: true })) {
    if (!ent.isDirectory() || ent.name.startsWith("_")) continue;

    const indexAbs = path.join(DOCS_ROOT, ent.name, "index.md");
    if (!fs.existsSync(indexAbs)) continue;

    const parsed = parseMdFile(indexAbs);
    if (parsed.meta.hidden) continue;

    const items = scanDir(path.join(DOCS_ROOT, ent.name), `/${ent.name}`);
    if (items.length === 0) continue;

    sidebar[`/${ent.name}`] = items;
  }

  return sidebar;
}
