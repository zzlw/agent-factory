<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

useHead({
  title: 'Agent Factory',
  htmlAttrs: { lang: 'zh-CN' },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
  ],
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'description', content: '智能体工作台' },
    { name: 'theme-color', content: '#fafafa', media: '(prefers-color-scheme: light)' },
    { name: 'theme-color', content: '#171717', media: '(prefers-color-scheme: dark)' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-title', content: 'Agent Factory' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
  ],
})

useSaveShortcut()
</script>

<template>
  <!-- 不加 antialiased：它是为西文优化的渲染模式，会把中文 PingFang 压得发虚偏细，中文界面优先原生 subpixel 渲染 -->
  <Body class="overscroll-none bg-background font-sans text-foreground">
    <NuxtPwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="top-center" />
  </Body>
</template>
