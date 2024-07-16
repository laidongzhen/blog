// export default [
//     {
//       text: 'Examples',
//     //   是否折叠
//     //   collapsed:true,
//       items: [
//         { text: 'Markdown Examples', link: '/markdown-examples' },
//         { text: 'Runtime API Examples', link: '/api-examples' }
//       ]
//     }
//   ]

export default {
  // frontend
  "/frontend/html/": [
    { text: "HTML", link: "/frontend/html/index.md" },
  ],
  "/frontend/css/": [
    { text: "CSS", link: "/frontend/html/index.md" },
  ],
  "/frontend/javascript/": [
    {
      text: "JavaScript",
      link: "/frontend/javascript/index.md",
    },
    {
      text: "初识JavaScript",
      link: "/frontend/javascript/01初识JavaScript.md",
    },
    {
      text: "变量、作用域与内存",
      link: "/frontend/javascript/04变量、作用域与内存.md",
    },
    {
      text: "引用值与原始值",
      link: "/frontend/javascript/05引用值与原始值.md",
    },
  ],
  "/frontend/vue/": [
    { text: "Vue", link: "/frontend/vue/index.md" },
  ],
  "/frontend/react/": [
    { text: "React", link: "/frontend/react/index.md" },
  ],
  "/topic/VitePress教程": [
    { text: "VitePress教程", link: "/topic/VitePress教程/index.md" },
    { text: "【架构师-1】需求分析和架构设计", link: "/topic/VitePress教程/【架构师-1】需求分析和架构设计.md" },
    { text: "使用VitePress和GitHub Actions搭建个人博客", link: "/topic/VitePress教程/使用VitePress和GitHub Actions搭建个人博客.md" },
  ],
  "/topic/ElementUI问题": [
    { text: "ElementUI问题", link: "/topic/ElementUI问题/index.md" },
    { text: "el-table表格左侧固定列el-table__fixed导致滚动条无法拖动", link: "/topic/ElementUI问题/el-table表格左侧固定列el-table__fixed导致滚动条无法拖动" },
    { text: "el-table中如何移除表单的校验结果", link: "/topic/ElementUI问题/el-table中如何移除表单的校验结果.md" },
  ],
  "/技术/git教程": [
    { text: "git教程", link: "/技术/git教程/index.md" },
  ],
}