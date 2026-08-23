<script setup lang="ts">
import { useSidebar } from '@/components/ui/sidebar'

const { activeSection, sections } = useWorkbench()
const { isMobile, setOpenMobile } = useSidebar()

// 无后台：用户信息为静态 Mock（答辩口径：真实接入时由账号体系提供）
const user = {
  name: '演示用户',
  email: 'demo@agent-factory.dev',
}

function selectSection(id: string) {
  activeSection.value = id
  if (isMobile.value) {
    setOpenMobile(false)
  }
}
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <div
        class="flex items-center px-1 py-1 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
      >
        <span
          class="hidden size-8 items-center justify-center rounded-md bg-[#E2231A] px-1 group-data-[collapsible=icon]:inline-flex"
        >
          <LenovoLogo class="w-full text-white" />
        </span>
        <div class="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <LenovoLogo class="mb-1.5 h-3 w-[3.75rem] text-[#E2231A]" />
          <p class="mt-1 text-xs text-muted-foreground">智能体工作台</p>
        </div>
      </div>
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
                @click="selectSection(section.id)"
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
