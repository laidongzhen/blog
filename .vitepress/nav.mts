/*
 * @Author: laidz laidz@yelinked.com
 * @Date: 2024-07-09 17:17:45
 * @LastEditors: laidz laidz@yelinked.com
 * @LastEditTime: 2025-11-17 22:05:39
 * @Description: 
 */
export default [
  { text: "首页", link: "/" },
  { text: "笔记", link: "/notes/" },
  {
    text: "前端",
    items: [
      {
        text: "基础",
        items: [
          {
            text: "HTML",
            link: "/frontend/html/",
          },
          { text: "CSS", link: "/frontend/css/" },
          {
            text: "JavaScript",
            link: "/frontend/javascript/",
          },
        ],

      },
      {
        text: "框架",
        items: [
          { text: "Vue", link: "/frontend/vue/" },
          {
            text: "React",
            link: "/frontend/react/",
          },
        ],
      },
    ],
  },
  {
    text: "专题",
    items: [
      { text: "VitePress教程", link: "/topic/VitePress教程/" },
      { text: "ElementUI问题", link: "/topic/ElementUI问题/" },
      { text: "Vue问题", link: "/topic/Vue问题/" },
      { text: "Vant问题", link: "/topic/Vant问题/" },
    ],
  },
  // {
  //   text: "技术",
  //   items: [
  //     { text: "git教程", link: "/技术/git教程/" },
  //   ],
  // },
  // 添加友情链接导航项
  { text: "友情链接", link: "/friends/" }
];