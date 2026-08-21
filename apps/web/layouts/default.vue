<script setup lang="ts">
// sidebar 折叠态走 URL query（v-model:open 受控），刷新/分享可恢复；cookie 兜底由 SidebarProvider 内部维护
const { sidebarOpen } = useWorkbench()
</script>

<template>
  <SidebarProvider v-model:open="sidebarOpen">
    <AppSidebar />
    <!-- h-svh 锁死视口（app-shell 模型）：经二分实验验证，滚动修复的决定性手段是 PlaygroundPanel 内消息区的 absolute 解耦；此处视口锁死作为纵深防御，保证未来任何面板内容都不会把页面撑出滚动条 -->
    <SidebarInset class="relative flex h-svh flex-col">
      <!-- 侧栏分界线：全高度统一手势（col-resize 光标 + hover 高亮 + 点击切换）；
           SidebarTrigger 在 Header 最左侧（距线 16px+），± 8px 热区不会碰到它，无需让位 -->
      <ResizeHandle
        mode="toggle"
        @click="sidebarOpen = !sidebarOpen"
      />
      <Header />
      <div class="flex min-h-0 flex-1 flex-col">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
