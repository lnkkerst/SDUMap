import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            vue: "vue/dist/vue.esm-bundler.js",
            "balm-ui-plus": "balm-ui/dist/balm-ui-plus.esm.js",
            "balm-ui-css": "balm-ui/dist/balm-ui.css",
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                admin: resolve(__dirname, "admin/index.html"),
            },
        },
    },
});
