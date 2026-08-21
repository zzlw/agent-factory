<script setup lang="ts">
const agentStore = useAgentStore()

const PROMPT_TEMPLATES = [
  {
    label: '客服助手',
    value:
      '你是一名专业的客服助手，请用友好、克制的语气回答用户问题，并明确拒绝回答超出范围的内容。',
  },
  {
    label: '知识库问答',
    value: '你是一名知识库问答助手，优先引用 {knowledge_base} 中的信息回答，无法命中时明确说明。',
  },
  {
    label: '任务型 Agent',
    value: '你是一名任务型助手，请拆解用户目标为可执行步骤，并在需要时调用工具完成任务。',
  },
]

const PROMPT_VARIABLES = ['{user_name}', '{company}', '{knowledge_base}']

const systemPromptRef = ref<HTMLTextAreaElement | null>(null)

const systemPromptChars = computed(() => agentStore.config.systemPrompt.length)
const systemPromptTokens = computed(() => Math.max(1, Math.ceil(systemPromptChars.value / 2)))

function applyPromptTemplate(value: string) {
  agentStore.updateConfig({ systemPrompt: value })
}

function insertPromptVariable(variable: string) {
  const textarea = systemPromptRef.value
  const current = agentStore.config.systemPrompt
  if (!textarea) {
    agentStore.updateConfig({ systemPrompt: `${current}${variable}` })
    return
  }
  const start = textarea.selectionStart ?? current.length
  const end = textarea.selectionEnd ?? current.length
  const next = `${current.slice(0, start)}${variable}${current.slice(end)}`
  agentStore.updateConfig({ systemPrompt: next })
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variable.length, start + variable.length)
  })
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>人设与开场</CardTitle>
      <CardDescription>定义 Agent 的身份、开场方式与行为边界。</CardDescription>
    </CardHeader>
    <CardContent class="grid gap-6 @2xl:grid-cols-2">
      <div class="space-y-2">
        <Label for="agent-name">名称</Label>
        <Input id="agent-name" v-model="agentStore.config.name" aria-label="Agent 名称" />
      </div>

      <div class="space-y-2">
        <Label for="agent-description">用途描述</Label>
        <Textarea
          id="agent-description"
          v-model="agentStore.config.description"
          rows="3"
        />
      </div>

      <div class="space-y-2 @2xl:col-span-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <Label for="system-prompt">System Prompt</Label>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{{ systemPromptChars }} 字符</span>
            <span>· 约 {{ systemPromptTokens }} tokens</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs text-muted-foreground">模板</span>
          <Button
            v-for="template in PROMPT_TEMPLATES"
            :key="template.label"
            variant="outline"
            size="sm"
            class="h-7 px-2 text-xs"
            @click="applyPromptTemplate(template.value)"
          >
            {{ template.label }}
          </Button>
          <span class="mx-1 text-xs text-muted-foreground">变量</span>
          <Button
            v-for="variable in PROMPT_VARIABLES"
            :key="variable"
            variant="ghost"
            size="sm"
            class="h-7 px-2 font-mono text-xs"
            @click="insertPromptVariable(variable)"
          >
            {{ variable }}
          </Button>
        </div>
        <Textarea
          ref="systemPromptRef"
          id="system-prompt"
          v-model="agentStore.config.systemPrompt"
          rows="10"
          class="font-mono"
        />
        <p class="text-xs text-muted-foreground">
          建议明确拒绝回答的范围，并给出期望的回复风格。
        </p>
      </div>

      <div class="space-y-2 @2xl:col-span-2">
        <Label for="first-message">First Message</Label>
        <Textarea
          id="first-message"
          v-model="agentStore.config.firstMessage"
          rows="5"
        />
      </div>
    </CardContent>
  </Card>
</template>
