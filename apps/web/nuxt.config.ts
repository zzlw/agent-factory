import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@pinia/colada-nuxt', 'shadcn-nuxt', '@nuxt/fonts'],

  shadcn: {
    prefix: '',
    componentDir: '~/components/ui',
  },
  compatibilityDate: '2025-07-15',
  telemetry: false,
  // 根路径重定向到概览分区（打开工作台先看概览，与左侧菜单首项一致）
  routeRules: {
    '/': { redirect: '/overview' },
  },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
      // 只扫 .vue：ai-elements 的 index.ts/context.ts 等非组件文件不参与自动导入，避免同名告警
      pattern: ['**/*.vue'],
    },
  ],
  build: {
    transpile: ['@agent-factory/agent-core', '@agent-factory/mock-engine'],
  },
})
