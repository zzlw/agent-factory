import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    'shadcn-nuxt',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
  ],
  shadcn: {
    prefix: '',
    componentDir: '~/components/ui',
  },
  compatibilityDate: '2025-07-15',
  telemetry: false,
  colorMode: {
    classSuffix: '',
  },
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
