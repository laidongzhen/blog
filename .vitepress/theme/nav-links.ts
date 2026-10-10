export interface NavLink {
  title: string;
  desc: string;
  link: string;
}

export interface NavGroupData {
  title: string;
  items: NavLink[];
}

export const navGroups: NavGroupData[] = [
  {
    title: "常用资源",
    items: [
      {
        title: "MDN Web Docs",
        desc: "HTML、CSS、JavaScript 权威参考",
        link: "https://developer.mozilla.org/",
      },
      {
        title: "Vue 官方文档",
        desc: "Vue 中文文档",
        link: "https://cn.vuejs.org/",
      },
      {
        title: "React 官方文档",
        desc: "React 官方文档",
        link: "https://reactjs.org/",
      },
    ],
  },
  {
    title: "学习资源",
    items: [
      {
        title: "Jeecg 文档",
        desc: "JeecgBoot 前端 UI 文档",
        link: "https://help.jeecg.com/ui/",
      },
    ],
  },
  {
    title: "前端体系",
    items: [
      {
        title: "web 前端知识",
        desc: "前端知识体系整理",
        link: "https://www.kancloud.cn/maryong/maryong/1724398",
      },
      {
        title: "前端渡劫秘籍",
        desc: "前端进阶笔记",
        link: "https://www.yuque.com/xiumubai/doc",
      },
    ],
  },
  {
    title: "技术博客",
    items: [
      {
        title: "茂茂物语",
        desc: "VitePress 主题博客",
        link: "https://fe-mm.com/",
      },
      {
        title: "antfu.me",
        desc: "Anthony Fu 的个人站点",
        link: "https://antfu.me/",
      },
      {
        title: "云游君",
        desc: "云游君的个人博客",
        link: "https://www.yunyoujun.cn/",
      },
      {
        title: "一尾流莺",
        desc: "前端技术博客",
        link: "http://www.warblerfe.top/",
      },
      {
        title: "CODING 修炼小册",
        desc: "编程学习小册",
        link: "https://wenyuan.github.io/",
      },
    ],
  },
  {
    title: "面试刷题",
    items: [
      {
        title: "web 前端面试",
        desc: "面试官系列，按模块整理的面试题",
        link: "https://vue3js.cn/interview/",
      },
      {
        title: "前端面试派",
        desc: "前端面试题库",
        link: "https://www.mianshipai.com/",
      },
      {
        title: "面试鸭",
        desc: "面试题与刷题",
        link: "https://www.mianshiya.com/",
      },
    ],
  },
];
