import { nextTick, onMounted, watch } from "vue";
import DefaultTheme from "vitepress/theme";
import { useRoute } from "vitepress";
import Viewer from "viewerjs";
import vitepressNprogress from "vitepress-plugin-nprogress";
import vitepressBackToTop from "vitepress-plugin-back-to-top";

import "vitepress-plugin-nprogress/lib/css/index.css";
import "vitepress-plugin-back-to-top/dist/style.css";
import "viewerjs/dist/viewer.css";
import "./custom.css";

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    vitepressNprogress(ctx);
    vitepressBackToTop({
      threshold: 300,
    });
  },
  setup() {
    const route = useRoute();
    let viewer: Viewer | undefined;

    const initViewer = () => {
      viewer?.destroy();
      viewer = undefined;

      const container = document.querySelector<HTMLElement>(".vp-doc");
      if (!container) return;

      viewer = new Viewer(container, {
        url: "src",
        navbar: true,
        title: false,
        toolbar: {
          zoomIn: 1,
          zoomOut: 1,
          oneToOne: 1,
          reset: 1,
          prev: 4,
          play: 0,
          next: 4,
          rotateLeft: 1,
          rotateRight: 1,
          flipHorizontal: 0,
          flipVertical: 0,
        },
        tooltip: true,
        movable: true,
        zoomable: true,
        zoomOnWheel: true,
        zoomOnTouch: true,
        rotatable: true,
        scalable: false,
        transition: true,
        fullscreen: true,
        keyboard: true,
        backdrop: true,
        container: "body",
        zIndex: 30000,
        filter(image: HTMLImageElement) {
          return Boolean(image.src);
        },
      });
    };

    onMounted(() => {
      initViewer();
    });

    watch(
      () => route.path,
      () => nextTick(() => initViewer())
    );
  },
};
