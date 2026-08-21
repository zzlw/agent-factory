<script setup lang="ts">
import { diffAgentConfig } from '@agent-factory/agent-core'
import { ArrowRight, CircleAlert, CircleCheck, Clock } from 'lucide-vue-next'

const agentStore = useAgentStore()
const { activeSection } = useWorkbench()

const capabilityCounts = computed(() => {
  const counts = { tool: 0, skill: 0, knowledgeBase: 0 }
  for (const item of agentStore.config.capabilities) {
    if (item.enabled) {
      counts[item.type] += 1
    }
  }
  return counts
})

const differences = computed(() =>
  agentStore.publishedConfig ? diffAgentConfig(agentStore.config, agentStore.publishedConfig) : [],
)

function statusText(status: string): string {
  if (status === 'draft') return '草稿'
  if (status === 'saved') return '已保存'
  return '已发布'
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
</script>

<template>
  <div class="grid gap-6">
    <section>
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <h2 class="truncate text-xl font-semibold">{{ agentStore.config.name }}</h2>
          <p class="mt-1 text-sm text-muted-foreground">{{ agentStore.config.description }}</p>
        </div>
        <Badge :variant="agentStore.status === 'draft' ? 'outline' : agentStore.status === 'saved' ? 'secondary' : 'default'">
          {{ statusText(agentStore.status) }} · v{{ agentStore.version }}
        </Badge>
      </div>
    </section>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Card class="py-4">
        <CardContent class="flex flex-col gap-1">
          <span class="text-sm text-muted-foreground">模型</span>
          <span class="font-medium">{{ agentStore.config.model }}</span>
          <span class="text-xs text-muted-foreground">
            Temperature {{ agentStore.config.temperature.toFixed(1) }}
          </span>
        </CardContent>
      </Card>

      <Card class="py-4">
        <CardContent class="flex flex-col gap-1">
          <span class="text-sm text-muted-foreground">已启用能力</span>
          <span class="font-medium">
            Tool {{ capabilityCounts.tool }} · Skill {{ capabilityCounts.skill }} · KB
            {{ capabilityCounts.knowledgeBase }}
          </span>
        </CardContent>
      </Card>

      <Card class="py-4">
        <CardContent class="flex flex-col gap-1">
          <span class="text-sm text-muted-foreground">最近保存 / 发布</span>
          <span class="flex items-center gap-1.5 text-sm">
            <Clock class="size-3.5 text-muted-foreground" />
            {{ formatTime(agentStore.lastSavedAt) }} / {{ formatTime(agentStore.lastPublishedAt) }}
          </span>
        </CardContent>
      </Card>
    </section>

    <Card>
      <CardHeader>
        <CardTitle>与线上版本对比</CardTitle>
        <CardDescription>
          当前编辑配置相对最近发布版本（v{{ agentStore.version }}）的变化。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="agentStore.hasUnpublishedChanges" class="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm">
          <CircleAlert class="size-4 text-amber-600" />
          当前配置与线上版本不同
        </div>
        <div v-else class="flex items-center gap-2 text-sm text-muted-foreground">
          <CircleCheck class="size-4 text-green-600" />
          当前配置与线上版本一致，无差异
        </div>

        <ul v-if="differences.length" class="mt-4 space-y-2">
          <li v-for="diff in differences" :key="diff.key" class="flex items-start gap-2 text-sm">
            <span class="min-w-20 shrink-0 text-muted-foreground">{{ diff.label }}</span>
            <span class="min-w-0 break-words">
              <span class="text-muted-foreground line-through">{{ diff.previous }}</span>
              <span class="mx-1.5 text-muted-foreground">→</span>
              <span>{{ diff.current }}</span>
            </span>
          </li>
        </ul>

        <Button variant="outline" size="sm" class="mt-4" @click="activeSection = 'versions'">
          查看完整差异
          <ArrowRight class="size-4" />
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
