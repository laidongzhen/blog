export default [
  { text: "首页", link: "/" },
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
  {
    text: "技术",
    items: [
      { text: "git教程", link: "/技术/git教程/" },
    ],
  },
];