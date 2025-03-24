import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//element-plus自动导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
//element-plus图标自动导入
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [
        ElementPlusResolver(), // 自动导入图标组件
        IconsResolver({
          //修改图标前缀，默认为i
          // prefix: 'icon'
        })
      ]
    }),
    Components({
      resolvers: [
        ElementPlusResolver(),
        // 自动注册图标组件,ep为指定图标集为elementplus
        IconsResolver({
          enabledCollections: ['ep']
        })
      ]
    }),
    Icons({
      autoInstall: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      //解决本地代理错误的问题
      //api是自行设置的请求前缀，任何请求路径以/api开头的请求将被代理到对应的target目标
      '/api': {
        target: 'http://localhost:8001', //目标域名
        changeOrigin: true, //需要代理跨域
        rewrite: (path) => path.replace(/^\/api/, '') //路径重写，把'/api'替换为''
      },
      '/mqtt': {
        target: 'http://localhost:8883', //目标域名
        changeOrigin: true, //需要代理跨域
        rewrite: (path) => path.replace(/^\/mqtt/, '') //路径重写，把'/api'替换为''
      }
    }
  }
})
