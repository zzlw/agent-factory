import tailwindcss from '@tailwindcss/vite'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    'shadcn-nuxt',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
  ],
  pwa: {
    registerType: 'prompt',
    registerWebManifestInRouteRules: true,
    includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
    manifest: {
      id: '/',
      name: 'Agent Factory',
      short_name: 'Agent Factory',
      description: '智能体工作台',
      lang: 'zh-CN',
      start_url: '/overview',
      scope: '/',
      display: 'standalone',
      orientation: 'any',
      background_color: '#fafafa',
      theme_color: '#fafafa',
      categories: ['productivity', 'developer'],
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,webmanifest}'],
      navigateFallback: undefined,
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: /\/api\//,
          handler: 'NetworkOnly',
        },
      ],
    },
    client: {
      periodicSyncForUpdates: 3600,
    },
    devOptions: {
      enabled: false,
    },
  },
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
