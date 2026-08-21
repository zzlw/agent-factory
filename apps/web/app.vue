<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

useHead({
  htmlAttrs: { lang: 'zh-CN' },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
  ],
})

useSaveShortcut()
</script>

<template>
  <!-- 不加 antialiased：它是为西文优化的渲染模式，会把中文 PingFang 压得发虚偏细，中文界面优先原生 subpixel 渲染 -->
  <Body class="overscroll-none bg-background font-sans text-foreground">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="top-center" />
  </Body>
</template>
