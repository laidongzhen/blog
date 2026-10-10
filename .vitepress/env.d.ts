declare module "*.css" {}

declare module "vitepress-plugin-nprogress" {
  import type { EnhanceAppContext } from "vitepress";
  const vitepressNprogress: (ctx: EnhanceAppContext) => void;
  export default vitepressNprogress;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
