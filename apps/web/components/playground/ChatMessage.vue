<script setup lang="ts">
import type { Message, TraceStep } from '@agent-factory/agent-core'
import { CheckIcon, ChevronRightIcon, CopyIcon } from '@lucide/vue'

const props = defineProps<{
  message: Message
  trace?: TraceStep[]
}>()

const copied = ref(false)

async function copyMessage() {
  await navigator.clipboard.writeText(props.message.content)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1500)
}
</script>

<template>
  <!-- 用户/助手消息走 ai-elements Message 体系；tool 消息走 Tool 折叠卡片 -->
  <Message
    v-if="message.role !== 'tool'"
    :from="message.role === 'user' ? 'user' : 'assistant'"
    class="relative"
  >
    <div class="flex min-w-0 flex-col gap-2">
      <MessageContent>
        <!-- 助手消息按 Markdown 渲染（mock 回复含列表/加粗等结构） -->
        <MessageResponse v-if="message.role === 'assistant'" :content="message.content" />
        <template v-else>{{ message.content }}</template>
      </MessageContent>

      <!-- 执行轨迹是调试性元信息：轻量行内折叠（对齐 LangSmith / Vercel AI chat 的 trace 展示），不占视觉重心 -->
      <details v-if="message.role === 'assistant' && trace && trace.length" class="group/details text-[13px] text-muted-foreground">
        <summary class="inline-flex w-fit cursor-pointer select-none items-center gap-0.5 rounded px-1 py-0.5 -ml-1 hover:text-foreground [&::-webkit-details-marker]:hidden">
          <ChevronRightIcon class="size-3 transition-transform group-open/details:rotate-90" />
          执行轨迹（{{ trace.length }} 步）
        </summary>
        <ol class="mt-1 space-y-1 border-l pl-3">
          <li v-for="step in trace" :key="step.id">
            {{ step.title }}：{{ step.detail }}
          </li>
        </ol>
      </details>

      <MessageActions
        v-if="message.role === 'assistant'"
        class="absolute top-0 right-0 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <MessageAction tooltip="复制" @click="copyMessage">
          <CheckIcon v-if="copied" class="size-4 text-green-600" />
          <CopyIcon v-else class="size-4" />
        </MessageAction>
      </MessageActions>
    </div>
  </Message>

  <!-- tool 消息：与 Trace 同款的轻量行内折叠，只在消息流里占一行 -->
  <details v-else class="group/tool text-[13px] text-muted-foreground">
    <summary
      class="inline-flex w-fit cursor-pointer select-none items-center gap-1.5 rounded px-1 py-0.5 -ml-1 hover:text-foreground [&::-webkit-details-marker]:hidden"
    >
      <ChevronRightIcon class="size-3 transition-transform group-open/tool:rotate-90" />
      <span class="font-medium text-foreground">
        调用 {{ message.toolCall?.name ?? '工具' }}
      </span>
      <span class="truncate">{{ message.toolCall?.result || message.content }}</span>
    </summary>
    <div class="mt-1.5 space-y-1 rounded-md bg-muted/40 px-2.5 py-2">
      <div>参数：<code class="font-mono text-xs">{{ message.toolCall?.args }}</code></div>
      <div>结果：{{ message.toolCall?.result || message.content }}</div>
    </div>
  </details>
</template>
