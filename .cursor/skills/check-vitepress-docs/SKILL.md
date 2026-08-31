---
name: check-vitepress-docs
description: >-
  Checks VitePress markdown under docs/ for Vue-breaking syntax (bare
  script/style/template tags and {{ }} interpolations) that blank the article
  body. Use when adding or editing docs markdown, before git commit, or when
  the user mentions 校验文档, 文档校验, 提交前检查, 页面空白, or 书写注意事项.
---

# 校验 VitePress 文档

改完 `docs/` 下的 `.md` 后立刻跑校验，不要等用户再说。提交前也要跑。

## 命令

仓库根目录：

```bash
pnpm run docs:check
```

只查暂存的文档（和 pre-commit 钩子相同）。指定文件：

```bash
node scripts/check-docs.mjs docs/handbook/项目/某篇.md
```

查全部文档（历史文可能有存量问题，不必为旧文一次性改完）：

```bash
pnpm run docs:check:all
```

## 失败时

按脚本打印的「问题 / 修改」改 md，再跑同一条命令，直到退出码 0。

典型改法：

- 标签写成「script setup」「style 块」，Vue 示例放进围栏代码块（语言标 vue）
- `{{ user.name }}` 改成普通文字，或放进三反引号代码块
- 不要在表格、行内反引号、正文里打完整尖括号标签和双花括号

原因见仓库根目录 `书写注意事项.md` 的「侧栏在、正文空白」。
