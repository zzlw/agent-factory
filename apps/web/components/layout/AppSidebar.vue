<script setup lang="ts">
import { Bot } from 'lucide-vue-next'

const { activeSection, sections } = useWorkbench()

// 无后台：用户信息为静态 Mock（答辩口径：真实接入时由账号体系提供）
const user = {
  name: '演示用户',
  email: 'demo@agent-factory.dev',
}
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <!-- 用 SidebarMenuButton 承载品牌块：折叠时自动 size-8 居中，与菜单图标列对齐 -->
          <SidebarMenuButton size="lg" tooltip="Agent Factory 智能体工作台">
            <div
              class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
            >
              <Bot class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">Agent Factory</span>
              <span class="truncate text-xs text-muted-foreground">智能体工作台</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>配置</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="section in sections" :key="section.id">
              <SidebarMenuButton
                :data-active="activeSection === section.id"
                :tooltip="section.label"
                @click="activeSection = section.id"
              >
                <component :is="section.icon" />
                <span>{{ section.label }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarNavFooter :user="user" />
    </SidebarFooter>
    <!-- 不用模板自带的 SidebarRail：它与 ResizeHandle（分界线统一交互）重叠且功能重复，
         且其 button 本体被全局 cursor-pointer 补丁覆盖成手型，破坏分界线手势一致性 -->
  </Sidebar>
</template>
