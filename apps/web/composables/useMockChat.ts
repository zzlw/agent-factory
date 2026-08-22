import type { AgentConfig, Message, TraceStep } from '@agent-factory/agent-core'
import { buildMockReply } from '@agent-factory/mock-engine'
import { nanoid } from 'nanoid'
import { isServerUnavailable } from '~/lib/apiFallback'

const STREAM_INTERVAL_MS = 16

async function chatRequest(
  input: string,
  config: AgentConfig,
): Promise<{ messages: Message[]; trace: TraceStep[] }> {
  try {
    return await $fetch<{ messages: Message[]; trace: TraceStep[] }>(
      '/api/agent/chat' as string & {},
      { method: 'POST', body: { input, config } },
    )
  } catch (error) {
    if (!isServerUnavailable(error)) throw error
    return buildMockReply(input, config)
  }
}

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
  const streaming = ref(false)
  const configChanged = ref(false)
  let streamTask: { timer: ReturnType<typeof setInterval> | null } | null = null

  function stopStream() {
    if (streamTask?.timer) {
      clearInterval(streamTask.timer)
      streamTask.timer = null
    }
    streamTask = null
    streaming.value = false
  }

  function streamContent(message: Message, fullContent: string) {
    stopStream()
    streaming.value = true
    let index = 0
    streamTask = { timer: null }
    streamTask.timer = setInterval(() => {
      index += 1
      message.content = fullContent.slice(0, index)
      if (index >= fullContent.length) {
        stopStream()
      }
    }, STREAM_INTERVAL_MS)
  }

  watch(
    () => agentStore.config,
    () => {
      configChanged.value = true
    },
    { deep: true },
  )

  async function sendMessage(input: string) {
    const trimmed = input.trim()
    if (!trimmed || sending.value || streaming.value) {
      return
    }

    stopStream()
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
      const reply = await chatRequest(trimmed, config)

      for (const message of reply.messages) {
        messages.value.push(message)
        // 只把回复里的原始对象 push 进数组后，数组里拿到的才是响应式代理；
        // 直接改原始对象不会触发 UI 更新，因此流式改写必须经由代理引用。
        const renderedMessage = messages.value[messages.value.length - 1] as Message
        traceByMessage.value[message.id] = reply.trace.filter(
          (step) => step.messageId === message.id,
        )
        if (message.role === 'assistant') {
          const fullContent = message.content
          renderedMessage.content = ''
          streamContent(renderedMessage, fullContent)
        }
      }
      configChanged.value = false
    } finally {
      sending.value = false
    }
  }

  function resetSession() {
    stopStream()
    messages.value = [createFirstMessage(agentStore.config.firstMessage)]
    traceByMessage.value = {}
    configChanged.value = false
  }

  onMounted(() => {
    if (messages.value.length === 0) {
      resetSession()
    }
  })

  onBeforeUnmount(() => {
    stopStream()
  })

  return {
    messages,
    traceByMessage,
    sending,
    streaming,
    configChanged,
    sendMessage,
    resetSession,
    stopStream,
  }
}
