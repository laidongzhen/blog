/*
 * @Author: laidz laidz@yelinked.com
 * @Date: 2024-07-09 17:17:45
 * @LastEditors: laidz laidz@yelinked.com
 * @LastEditTime: 2025-03-17 17:59:52
 * @Description: 
 */
/*
 * @Author: laidz laidz@yelinked.com
 * @Date: 2024-07-09 17:17:45
 * @LastEditors: laidz laidz@yelinked.com
 * @LastEditTime: 2025-03-17 16:18:36
 * @Description: 
 */
/*
 * @Author: laidz laidz@yelinked.com
 * @Date: 2024-07-09 17:17:45
 * @LastEditors: laidz laidz@yelinked.com
 * @LastEditTime: 2025-03-17 16:16:22
 * @Description: 
 */
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
  // 笔记
  "/notes": [
    { text: "前端路线规划.md", link: "/notes/前端路线规划.md" },
    // { text: "前端路线规划.md", link: "/notes/index.md" },
    { 
        collapsed: false,
        text: "模块A", 
        items: [
            { text: '测试A-1', link: '/notes/moduleA/item-a.md' },
            // { text: '测试A-2', link: '/item-b' },
          ]
     },
     { 
        collapsed: false,
        text: "模块B", 
        items: [
            { text: '测试B-1', link: '/notes/moduleB/item-a' },
            { text: '测试B-2', link: '/notes/moduleB/item-b.md' },
          ]
     },
  ],

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
  ],
  "/frontend/vue/": [
    { text: "Vue", link: "/frontend/vue/index.md" },
  ],
  "/frontend/react/": [
    { text: "React", link: "/frontend/react/index.md" },
  ],
  "/topic/VitePress教程": [
    { text: "VitePress教程", link: "/topic/VitePress教程/index.md" },
    { text: "使用VitePress和GitHub Actions搭建个人博客", link: "/topic/VitePress教程/使用VitePress和GitHub Actions搭建个人博客.md" },
  ],
  "/topic/ElementUI问题": [
    { text: "ElementUI问题", link: "/topic/ElementUI问题/index.md" },
    { text: "el-table表格左侧固定列el-table__fixed导致滚动条无法拖动", link: "/topic/ElementUI问题/el-table表格左侧固定列el-table__fixed导致滚动条无法拖动" },
    { text: "el-table中如何移除表单的校验结果", link: "/topic/ElementUI问题/el-table中如何移除表单的校验结果.md" },
    { text: "ElementUI表格多选时点击某一行选中勾选框", link: "/topic/ElementUI问题/ElementUI表格多选时点击某一行选中勾选框.md" },
  ],
  "/topic/Vue问题": [
    { text: "Vue问题", link: "/topic/Vue问题/index.md" },
    { text: "vue2中this.$set()的基本用法", link: "/topic/Vue问题/vue2中this.$set()的基本用法" },
    { text: "vue中this.$emit(“update:xx“,value)和xx.sync的用法", link: "/topic/Vue问题/vue中this.$emit(“updatexx“,value)和xx.sync的用法" },
  ],
  "/topic/Vant问题": [
    { text: "vant中van-tabs有2个并且都设置sticky时如何生效.md", link: "/topic/Vant问题/vant中van-tabs有2个并且都设置sticky时如何生效.md" },
  ],
  "/技术/git教程": [
    { text: "git教程", link: "/技术/git教程/index.md" },
  ],
}