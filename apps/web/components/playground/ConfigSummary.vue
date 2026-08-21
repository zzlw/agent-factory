<script setup lang="ts">
const agentStore = useAgentStore()

const enabledToolCount = computed(
  () =>
    agentStore.config.capabilities.filter((item) => item.type === 'tool' && item.enabled).length,
)
const enabledSkillCount = computed(
  () =>
    agentStore.config.capabilities.filter((item) => item.type === 'skill' && item.enabled).length,
)
const enabledKnowledgeCount = computed(
  () =>
    agentStore.config.capabilities.filter((item) => item.type === 'knowledgeBase' && item.enabled)
      .length,
)

// 配置变更时短暂高亮，把“配置区 → 调试区”的联动显性化
const flash = ref(false)
let flashTimer: ReturnType<typeof setTimeout> | undefined

watch(
  () => agentStore.config,
  () => {
    flash.value = true
    clearTimeout(flashTimer)
    flashTimer = setTimeout(() => {
      flash.value = false
    }, 800)
  },
  { deep: true },
)

onBeforeUnmount(() => clearTimeout(flashTimer))
</script>

<template>
  <div
    class="space-y-1 rounded-lg p-3 text-xs transition-colors duration-500"
    :class="flash ? 'bg-primary/10 text-foreground' : 'bg-muted/60 text-muted-foreground'"
  >
    <p>模型：{{ agentStore.config.model }} · 温度：{{ agentStore.config.temperature }}</p>
    <p>能力：Tool {{ enabledToolCount }} / Skill {{ enabledSkillCount }} / KB {{ enabledKnowledgeCount }}</p>
    <p class="line-clamp-2" :title="agentStore.config.systemPrompt">
      Prompt：{{ agentStore.config.systemPrompt }}
    </p>
    <p class="font-medium text-foreground">状态：{{ agentStore.status }}</p>
  </div>
</template>
