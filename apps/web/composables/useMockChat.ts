import type { Message, TraceStep } from '@agent-factory/agent-core'
import { nanoid } from 'nanoid'

function createFirstMessage(content: string): Message {
  return {
    id: nanoid(),
    role: 'assistant',
    content,
    createdAt: new Date().toISOString(),
  }
}

export function useMockChat() {
  const agentStore = useAgentStore()
  const messages = ref<Message[]>([])
  const traceByMessage = ref<Record<string, TraceStep[]>>({})
  const sending = ref(false)
  const configChanged = ref(false)

  watch(
    () => agentStore.config,
    () => {
      configChanged.value = true
    },
    { deep: true },
  )

  async function sendMessage(input: string) {
    const trimmed = input.trim()
    if (!trimmed || sending.value) {
      return
    }

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    messages.value.push(userMessage)
    sending.value = true

    try {
      const config = JSON.parse(JSON.stringify(agentStore.config))
      const reply = await $fetch<{ messages: Message[]; trace: TraceStep[] }>(
        '/api/agent/chat' as string & {},
        {
          method: 'POST',
          body: { input: trimmed, config },
        },
      )

      for (const message of reply.messages) {
        messages.value.push(message)
        traceByMessage.value[message.id] = reply.trace.filter(
          (step) => step.messageId === message.id,
        )
      }
      configChanged.value = false
    } finally {
      sending.value = false
    }
  }

  function resetSession() {
    messages.value = [createFirstMessage(agentStore.config.firstMessage)]
    traceByMessage.value = {}
    configChanged.value = false
  }

  onMounted(() => {
    if (messages.value.length === 0) {
      resetSession()
    }
  })

  return {
    messages,
    traceByMessage,
    sending,
    configChanged,
    sendMessage,
    resetSession,
  }
}
