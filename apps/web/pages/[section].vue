<script setup lang="ts">
import { SECTION_IDS } from '~/composables/useWorkbench'

const { activeSection } = useWorkbench()

definePageMeta({
  ssr: false,
  // 非法分区 path 直接 404（动态路由单页承载：分区切换不卸载组件树，Playground 会话天然保留）
  validate: (route) => SECTION_IDS.includes(route.params.section as (typeof SECTION_IDS)[number]),
})

// 分区切换是"换页面"语义，内容区滚动回顶部（业内 tab 切换标准行为）
const sectionEl = ref<HTMLElement | null>(null)
watch(activeSection, () => {
  sectionEl.value?.scrollTo({ top: 0 })
})
</script>

<template>
  <div class="flex min-h-0 flex-1">
    <section ref="sectionEl" class="@container/main min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
      <OverviewPanel v-if="activeSection === 'overview'" />
      <PersonaPanel v-if="activeSection === 'persona'" />
      <ModelPanel v-if="activeSection === 'model'" />
      <AbilitiesPanel v-if="activeSection === 'abilities'" />
      <VersionsPanel v-if="activeSection === 'versions'" />
    </section>
    <PlaygroundPanel />
  </div>
</template>
