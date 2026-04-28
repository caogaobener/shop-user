import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 新增这部分配置：解决 hash 模式刷新 404
  server: {
    historyApiFallback: true, // 核心：让所有路由请求都回退到 index.html
    watch: {
      usePolling: true
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    }
  }
 
})
