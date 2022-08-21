import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';

import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/',
  plugins: [
    vue(),
    Pages({
      dirs: [
        { dir: 'src/pages', baseRoute: '' },
        { dir: 'src/admin/pages', baseRoute: 'admin' }
      ]
    })
  ],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': resolve(__dirname, 'src'),
      // eslint-disable-next-line no-undef
      '@admin': resolve(__dirname, 'src/admin'),
      vue: 'vue/dist/vue.esm-bundler.js',
      'balm-ui-plus': 'balm-ui/dist/balm-ui-plus.esm.js',
      'balm-ui-css': 'balm-ui/dist/balm-ui.css'
    }
  },
  build: {
    rollupOptions: {
      input: {
        // eslint-disable-next-line no-undef
        main: resolve(__dirname, 'src/index.html'),
        // eslint-disable-next-line no-undef
        admin: resolve(__dirname, 'src/admin/index.html')
      }
    },
    // eslint-disable-next-line no-undef
    outDir: resolve(__dirname, 'dist')
  }
});
