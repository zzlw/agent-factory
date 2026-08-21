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
  <Message v-if="message.role !== 'tool'" :from="message.role === 'user' ? 'user' : 'assistant'">
    <div class="flex min-w-0 flex-col gap-1">
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

      <MessageActions v-if="message.role === 'assistant'" class="opacity-0 transition-opacity group-hover:opacity-100">
        <MessageAction tooltip="复制" @click="copyMessage">
          <CheckIcon v-if="copied" class="size-4 text-green-600" />
          <CopyIcon v-else class="size-4" />
        </MessageAction>
      </MessageActions>
    </div>
  </Message>

  <!-- tool 消息：折叠卡片只保留调用摘要，参数/结果用紧凑行内文本，避免 CodeBlock 撑高 -->
  <Tool v-else class="mb-0">
    <ToolHeader
      type="dynamic-tool"
      :tool-name="message.toolCall?.name ?? '工具调用'"
      :title="message.toolCall?.name ?? '工具调用'"
      state="output-available"
    />
    <ToolContent>
      <div class="space-y-2 px-4 py-3 text-sm">
        <div class="flex items-start gap-2">
          <span class="shrink-0 text-muted-foreground">参数</span>
          <code class="min-w-0 break-all rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            {{ message.toolCall?.args }}
          </code>
        </div>
        <div class="flex items-start gap-2">
          <span class="shrink-0 text-muted-foreground">结果</span>
          <span class="min-w-0 break-words">{{ message.toolCall?.result || message.content }}</span>
        </div>
      </div>
    </ToolContent>
  </Tool>
</template>
