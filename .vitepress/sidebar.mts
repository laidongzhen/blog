export default {
  // 笔记
  "/notes": [
    { text: "前端路线规划.md", link: "/notes/前端路线规划.md" },
    { 
        collapsed: false,
        text: "Vue", 
        items: [
            { text: 'Vue3基础语法', link: '/notes/Vue/Vue3基础语法.md' },
            { text: 'vue3源码解析', link: '/notes/Vue/vue3源码解析.md' },
          ]
     },
    { 
        collapsed: false,
        text: "工具与流程", 
        items: [
            { text: '仓库镜像管理：Gitee-Github 双向同步', link: '/notes/工具与流程/仓库镜像管理.md' },
            { text: 'VSCode如何找回未提交到远程的代码', link: '/notes/工具与流程/VSCode如何找回未提交到远程的代码.md' },
            { text: '高级软考系统架构设计师', link: '/notes/工具与流程/高级软考系统架构设计师.md' },
            { text: '通过phpstudy和wordpress在本地新建一个网站', link: '/notes/工具与流程/通过phpstudy和wordpress在本地新建一个网站.md' },
          ]
     },
    { 
        collapsed: false,
        text: "项目问题", 
        items: [
            { text: 'el-form表单展开和收起功能根据字段自适应实现', link: '/notes/项目问题/elForm表单展开和收起功能根据字段自适应实现.md' },
            { text: "el-table表格左侧固定列el-table__fixed导致滚动条无法拖动", link: "/notes/项目问题/el-table表格左侧固定列el-table__fixed导致滚动条无法拖动" },
            { text: "el-table中如何移除表单的校验结果", link: "/notes/项目问题/el-table中如何移除表单的校验结果.md" },
            { text: "ElementUI表格多选时点击某一行选中勾选框", link: "/notes/项目问题/ElementUI表格多选时点击某一行选中勾选框.md" },
          ]
     },
    { 
        collapsed: false,
        text: "杂", 
        items: [
            { text: '写博客文章注意点', link: '/notes/杂/写博客文章注意点.md' },
          ]
     },
    // { 
    //     collapsed: false,
    //     text: "模块A", 
    //     items: [
    //         { text: '测试A-1', link: '/notes/moduleA/item-a.md' },
    //         // { text: '测试A-2', link: '/item-b' },
    //       ]
    //  },
    //  { 
    //     collapsed: false,
    //     text: "模块B", 
    //     items: [
    //         { text: '测试B-1', link: '/notes/moduleB/item-a' },
    //         { text: '测试B-2', link: '/notes/moduleB/item-b.md' },
    //       ]
    //  },
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
    { 
      collapsed: false,
      text: "coderwhy的vue3", 
      items: [
          { text: '邂逅Vue3开发', link: '/frontend/vue/coderwhy的vue3/邂逅Vue3开发.md' },
          { text: 'Vue基础之模板语法', link: '/frontend/vue/coderwhy的vue3/Vue基础之模板语法.md' },
          { text: 'Vue3的OptionsAPI', link: '/frontend/vue/coderwhy的vue3/Vue3的OptionsAPI.md' },
        ]
    },
  ],
  "/frontend/react/": [
    { text: "React", link: "/frontend/react/index.md" },
    { 
      collapsed: false,
      text: "React教程", 
      items: [
          { text: 'React入门', link: '/frontend/react/React教程/React入门.md' },
          { text: '工具', link: '/frontend/react/React教程/工具.md' },
        ]
    },
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
  // "/技术/git教程": [
  //   { text: "git教程", link: "/技术/git教程/index.md" },
  // ],
}