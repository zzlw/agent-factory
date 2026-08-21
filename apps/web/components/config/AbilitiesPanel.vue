<script setup lang="ts">
import type { CapabilityType } from '@agent-factory/agent-core'
import { BookOpen, Puzzle, Wrench } from 'lucide-vue-next'

const agentStore = useAgentStore()

const typeLabels: Record<CapabilityType, string> = {
  tool: 'Tool',
  skill: 'Skill',
  knowledgeBase: 'Knowledge Base',
}

const typeIcons = {
  tool: Wrench,
  skill: Puzzle,
  knowledgeBase: BookOpen,
}

const search = ref('')

const filteredCapabilities = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) {
    return agentStore.config.capabilities
  }
  return agentStore.config.capabilities.filter((item) =>
    `${item.name}${item.description}`.toLowerCase().includes(keyword),
  )
})

function setCapabilityEnabled(id: string, enabled: boolean) {
  agentStore.updateConfig({
    capabilities: agentStore.config.capabilities.map((item) =>
      item.id === id ? { ...item, enabled } : item,
    ),
  })
}
</script>

<template>
  <div class="grid gap-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">能力</h2>
        <p class="text-sm text-muted-foreground">
          管理 Agent 可调用的 Tool、Skill 与 Knowledge Base。
        </p>
      </div>
      <Input v-model="search" class="w-56" placeholder="搜索能力" />
    </div>

    <div v-if="filteredCapabilities.length" class="grid gap-3">
      <Card
        v-for="capability in filteredCapabilities"
        :key="capability.id"
        class="py-4"
      >
        <CardContent class="flex items-start gap-4">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <component :is="typeIcons[capability.type]" class="size-5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-medium">{{ capability.name }}</span>
              <Badge variant="secondary">{{ typeLabels[capability.type] }}</Badge>
              <Badge v-if="capability.integration === 'mcp'" variant="outline">MCP</Badge>
            </div>
            <p class="mt-1 text-sm text-muted-foreground">{{ capability.description }}</p>
          </div>
          <Switch
            :model-value="capability.enabled"
            aria-label="启用开关"
            @update:model-value="setCapabilityEnabled(capability.id, $event)"
          />
        </CardContent>
      </Card>
    </div>

    <Empty v-else>
      <EmptyHeader>
        <EmptyTitle>没有匹配的能力</EmptyTitle>
        <EmptyDescription>尝试更换关键词，或清空搜索查看全部能力。</EmptyDescription>
      </EmptyHeader>
    </Empty>
  </div>
</template>
