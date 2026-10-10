import { defineConfig } from "vitepress";
// 顶部菜单
import nav from "./nav.mts";
// 侧边栏菜单
import sidebar from "./sidebar.mts";

// https://vitepress.dev/reference/site-config
// 配置智能提示
// 使用 defineConfig 辅助函数将为配置选项提供 TypeScript 支持的智能提示。
// 假设 IDE 支持它，那么在 JavaScript 和 TypeScript 中都将触发智能提示。
export default defineConfig({
    // 设定public根目录，
    base: "/blog/",
    // 应用级配置选项
    lang: "zh-CN",
    // title:站点的标题。
    title: "laidongzhen's blog",
    // 添加 vue 配置项解决构建错误
    // vue: {
    //   template: {
    //     compilerOptions: {
    //       whitespace: 'preserve'  // 关键配置
    //     }
    //   }
    // },
    // 允许自定义每个页面的标题后缀或整个标题
    titleTemplate: "",
    // 站点的描述
    description: "前端笔记、页面解析和项目实操",
    // 浏览器标签页图标。站点 base 是 /blog/，href 要带上这个前缀。
    // 文件放在 docs/public，开发时由 Vite 从 srcDir（docs）的 public 目录提供。
    head: [
        [
            "link",
            {
                rel: "icon",
                type: "image/svg+xml",
                href: "/blog/favicon.svg",
            },
        ],
    ],
    cleanUrls: true,
    // 设置独立的文档目录，把原根目录下的文章（文档目录）放到 docs 文件夹下
    srcDir: "docs",
    lastUpdated: true,
    // themeConfig:主题类型提示
    themeConfig: {
        nav,
        sidebar,
        siteTitle: "laidongzhen's blog",
        search: {
            provider: "local",
            options: {
                translations: {
                    button: {
                        buttonText: "搜索文档",
                        buttonAriaLabel: "搜索文档",
                    },
                    modal: {
                        noResultsText: "无法找到相关结果",
                        resetButtonTitle: "清除查询条件",
                        footer: {
                            selectText: "选择",
                            navigateText: "切换",
                        },
                    },
                },
            },
        },
        docFooter: {
            prev: "上一篇",
            next: "下一篇",
        },
        // 友情链接
        socialLinks: [
            { icon: "github", link: "https://github.com/laidongzhen" },
        ],
        // 页脚配置
        footer: {
            message:
                '个人博客，欢迎 <a style="color: #0066ff" href="https://github.com/laidongzhen/blog">star ⭐</a> 让更多人发现',
            copyright:
                "MIT License | 版权所有 © 2023-2026 laidongzhen contributors",
        },
        // 最后更新时间的显示文本
        lastUpdatedText: "最后一次更新于",
        outline: {
            level: [1, 3],
            label: "本页目录", // 可选，改右侧栏标题
        },
    },
});
