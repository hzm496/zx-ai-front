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
  server: {
    port: 5173,
    proxy: {
      // Web 端代理 (8080)
      '/api/web': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/web/, '/web')
          console.log(`[Web Proxy] ${path} -> ${newPath}`)
          return newPath
        }
      },
      // Admin 端代理 (8081)
      '/api/admin': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => {
          const newPath = path.replace(/^\/api\/admin/, '/admin')
          console.log(`[Admin Proxy] ${path} -> ${newPath}`)
          return newPath
        }
      }
    }
  }
})
