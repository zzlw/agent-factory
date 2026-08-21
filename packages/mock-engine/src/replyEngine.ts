import type { AgentConfig, Message, TraceStep } from '@agent-factory/agent-core'
import { nanoid } from 'nanoid'

export interface MockReply {
  messages: Message[]
  trace: TraceStep[]
}

function createMessage(
  role: Message['role'],
  content: string,
  toolCall?: Message['toolCall'],
): Message {
  return {
    id: nanoid(),
    role,
    content,
    createdAt: new Date().toISOString(),
    toolCall,
  }
}

function createTraceStep(
  messageId: string,
  type: TraceStep['type'],
  title: string,
  detail: string,
  status: TraceStep['status'] = 'success',
): TraceStep {
  return {
    id: nanoid(),
    messageId,
    type,
    title,
    detail,
    status,
    createdAt: new Date().toISOString(),
  }
}

function weatherToolEnabled(config: AgentConfig): boolean {
  return config.capabilities.some(
    (item) => item.type === 'tool' && item.name === '天气查询' && item.enabled,
  )
}

function knowledgeBaseEnabled(config: AgentConfig): boolean {
  return config.capabilities.some(
    (item) => item.type === 'knowledgeBase' && item.name === '退款政策知识库' && item.enabled,
  )
}

export function buildMockReply(input: string, config: AgentConfig): MockReply {
  const trace: TraceStep[] = []

  if (weatherToolEnabled(config) && input.includes('天气')) {
    const rawResult = '{"city":"北京","condition":"晴","temperature":22}'
    const toolMessage = createMessage('tool', rawResult, {
      name: '天气查询',
      args: '{"city":"北京"}',
      result: rawResult,
    })
    const assistantMessage = createMessage('assistant', '北京今天晴，22°C。')
    trace.push(createTraceStep(assistantMessage.id, 'toolCall', '调用天气查询', '{"city":"北京"}'))
    return { messages: [toolMessage, assistantMessage], trace }
  }

  if (!weatherToolEnabled(config) && input.includes('天气')) {
    const assistantMessage = createMessage('assistant', '我没有天气查询能力')
    return { messages: [assistantMessage], trace }
  }

  if (knowledgeBaseEnabled(config) && input.includes('退款')) {
    const assistantMessage = createMessage(
      'assistant',
      '已检索知识库：退款政策支持 7 天内无理由退款。',
    )
    trace.push(
      createTraceStep(
        assistantMessage.id,
        'knowledgeBase',
        '知识库命中',
        '退款政策知识库：7 天无理由退款',
      ),
    )
    return { messages: [assistantMessage], trace }
  }

  const assistantMessage = input.includes('你是谁')
    ? createMessage('assistant', config.systemPrompt.slice(0, 40))
    : createMessage('assistant', config.firstMessage)

  return { messages: [assistantMessage], trace }
}
