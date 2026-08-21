<script setup lang="ts">
import { type AgentConfig, diffAgentConfig } from '@agent-factory/agent-core'

const props = defineProps<{
  current: AgentConfig
  previous: AgentConfig
}>()

const differences = computed(() => diffAgentConfig(props.current, props.previous))
</script>

<template>
  <div v-if="differences.length" class="space-y-3">
    <div v-for="diff in differences" :key="diff.key" class="rounded-md border p-3">
      <div class="mb-2 flex items-center justify-between gap-2">
        <span class="text-sm font-medium">{{ diff.label }}</span>
      </div>
      <dl class="space-y-2 text-sm">
        <div>
          <dt class="text-xs text-muted-foreground">旧值</dt>
          <dd class="whitespace-pre-wrap break-words text-muted-foreground line-through">
            {{ diff.previous }}
          </dd>
        </div>
        <div>
          <dt class="text-xs text-muted-foreground">新值</dt>
          <dd class="whitespace-pre-wrap break-words">{{ diff.current }}</dd>
        </div>
      </dl>
    </div>
  </div>
  <p v-else class="text-sm text-muted-foreground">两份配置完全一致，无字段级差异。</p>
</template>
