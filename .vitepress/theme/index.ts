import DefaultTheme from "vitepress/theme";
import vitepressNprogress from "vitepress-plugin-nprogress";
import vitepressBackToTop from "vitepress-plugin-back-to-top";

import "vitepress-plugin-nprogress/lib/css/index.css";
import "vitepress-plugin-back-to-top/dist/style.css";

export default {
    ...DefaultTheme,
    enhanceApp(ctx) {
        vitepressNprogress(ctx);
        vitepressBackToTop({
            // default
            threshold: 300,
        });
    },

}