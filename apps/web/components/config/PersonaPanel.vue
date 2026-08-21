<script setup lang="ts">
import { type AgentConfig, personaFormSchema } from '@agent-factory/agent-core'
import { toTypedSchema } from '@vee-validate/zod'
import { useFieldError, useForm } from 'vee-validate'

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

interface PersonaValues {
  name: string
  description: string
  systemPrompt: string
  firstMessage: string
}

const { defineComponentBinds, values, setFieldValue } = useForm<PersonaValues>({
  validationSchema: toTypedSchema(personaFormSchema),
  initialValues: {
    name: agentStore.config.name,
    description: agentStore.config.description,
    systemPrompt: agentStore.config.systemPrompt,
    firstMessage: agentStore.config.firstMessage,
  },
})

const nameBinds = defineComponentBinds<'name', string>('name')
const descriptionBinds = defineComponentBinds<'description', string>('description')
const systemPromptBinds = defineComponentBinds<'systemPrompt', string>('systemPrompt')
const firstMessageBinds = defineComponentBinds<'firstMessage', string>('firstMessage')

const nameError = useFieldError('name')
const descriptionError = useFieldError('description')
const systemPromptError = useFieldError('systemPrompt')
const firstMessageError = useFieldError('firstMessage')

const systemPromptRef = ref<HTMLTextAreaElement | null>(null)

const systemPromptChars = computed(() => values.systemPrompt.length)
const systemPromptTokens = computed(() => Math.max(1, Math.ceil(systemPromptChars.value / 2)))

function applyPromptTemplate(value: string) {
  setFieldValue('systemPrompt', value)
}

function onNameInput(value: string | number) {
  nameBinds.value['onUpdate:modelValue'](String(value))
}

function onDescriptionInput(value: string | number) {
  descriptionBinds.value['onUpdate:modelValue'](String(value))
}

function onSystemPromptInput(value: string | number) {
  systemPromptBinds.value['onUpdate:modelValue'](String(value))
}

function onFirstMessageInput(value: string | number) {
  firstMessageBinds.value['onUpdate:modelValue'](String(value))
}

function insertPromptVariable(variable: string) {
  const textarea = systemPromptRef.value
  const current = values.systemPrompt
  if (!textarea) {
    setFieldValue('systemPrompt', `${current}${variable}`)
    return
  }
  const start = textarea.selectionStart ?? current.length
  const end = textarea.selectionEnd ?? current.length
  const next = `${current.slice(0, start)}${variable}${current.slice(end)}`
  setFieldValue('systemPrompt', next)
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variable.length, start + variable.length)
  })
}

// 表单 ↔ 全局 store 的双向同步：表单是编辑态来源，store 是状态机与 Playground 快照来源。
// 每次写入前先做相等判断，两侧只会收敛而不会互相触发循环。
watch(
  () => ({
    name: values.name,
    description: values.description,
    systemPrompt: values.systemPrompt,
    firstMessage: values.firstMessage,
  }),
  (next) => {
    const patch: Partial<AgentConfig> = {}
    if (next.name !== agentStore.config.name) patch.name = next.name
    if (next.description !== agentStore.config.description) patch.description = next.description
    if (next.systemPrompt !== agentStore.config.systemPrompt) patch.systemPrompt = next.systemPrompt
    if (next.firstMessage !== agentStore.config.firstMessage) patch.firstMessage = next.firstMessage
    if (Object.keys(patch).length > 0) {
      agentStore.updateConfig(patch)
    }
  },
)

watch(
  () => ({
    name: agentStore.config.name,
    description: agentStore.config.description,
    systemPrompt: agentStore.config.systemPrompt,
    firstMessage: agentStore.config.firstMessage,
  }),
  (next) => {
    if (next.name !== values.name) setFieldValue('name', next.name)
    if (next.description !== values.description) setFieldValue('description', next.description)
    if (next.systemPrompt !== values.systemPrompt) setFieldValue('systemPrompt', next.systemPrompt)
    if (next.firstMessage !== values.firstMessage) setFieldValue('firstMessage', next.firstMessage)
  },
)
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
        <Input
          id="agent-name"
          :model-value="nameBinds.modelValue"
          aria-label="Agent 名称"
          @update:model-value="onNameInput"
          @blur="nameBinds.onBlur"
        />
        <p v-if="nameError" class="text-xs text-destructive">{{ nameError }}</p>
      </div>

      <div class="space-y-2">
        <Label for="agent-description">用途描述</Label>
        <Textarea
          id="agent-description"
          :model-value="descriptionBinds.modelValue"
          rows="3"
          @update:model-value="onDescriptionInput"
          @blur="descriptionBinds.onBlur"
        />
        <p v-if="descriptionError" class="text-xs text-destructive">{{ descriptionError }}</p>
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
          :model-value="systemPromptBinds.modelValue"
          rows="10"
          class="font-mono"
          @update:model-value="onSystemPromptInput"
          @blur="systemPromptBinds.onBlur"
        />
        <p v-if="systemPromptError" class="text-xs text-destructive">{{ systemPromptError }}</p>
        <p v-else class="text-xs text-muted-foreground">
          建议明确拒绝回答的范围，并给出期望的回复风格。
        </p>
      </div>

      <div class="space-y-2 @2xl:col-span-2">
        <Label for="first-message">First Message</Label>
        <Textarea
          id="first-message"
          :model-value="firstMessageBinds.modelValue"
          rows="5"
          @update:model-value="onFirstMessageInput"
          @blur="firstMessageBinds.onBlur"
        />
        <p v-if="firstMessageError" class="text-xs text-destructive">{{ firstMessageError }}</p>
      </div>
    </CardContent>
  </Card>
</template>
