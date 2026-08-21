<script setup lang="ts">
import { MODEL_OPTIONS, VOICE_OPTIONS } from '@agent-factory/mock-engine'

const agentStore = useAgentStore()

const temperature = computed<number[]>({
  get: () => [agentStore.config.temperature],
  set: (value: number[]) => {
    agentStore.updateConfig({ temperature: value[0] ?? 0 })
  },
})
</script>

<template>
  <div class="grid gap-6">
    <Card>
      <CardHeader>
        <CardTitle>模型</CardTitle>
        <CardDescription>选择驱动 Agent 回复的模型，并调节随机性。</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-6">
        <div class="grid gap-2">
          <Label for="model-select">模型</Label>
          <Select v-model="agentStore.config.model">
            <SelectTrigger id="model-select" class="w-full sm:w-80">
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="model in MODEL_OPTIONS" :key="model" :value="model">
                {{ model }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid gap-3">
          <div class="flex items-center justify-between">
            <Label for="temperature-slider">Temperature</Label>
            <span class="text-sm tabular-nums text-muted-foreground">
              {{ temperature[0]?.toFixed(1) }}
            </span>
          </div>
          <Slider
            id="temperature-slider"
            v-model="temperature"
            :min="0"
            :max="2"
            :step="0.1"
            class="max-w-80"
          />
          <p class="text-xs text-muted-foreground">
            值越高回复越发散，越低越稳定。Mock 引擎仅透传该参数，不模拟采样差异。
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>语音</CardTitle>
        <CardDescription>本期为只读展示，真实语音参数将在接入后端后开放。</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-wrap items-center gap-3">
        <Badge :variant="agentStore.config.voice.enabled ? 'default' : 'outline'">
          {{ agentStore.config.voice.enabled ? '已启用' : '未启用' }}
        </Badge>
        <span class="text-sm text-muted-foreground">音色：{{ agentStore.config.voice.name }}</span>
        <span class="text-sm text-muted-foreground">
          可选：{{ VOICE_OPTIONS.join(' / ') }}
        </span>
      </CardContent>
    </Card>
  </div>
</template>
