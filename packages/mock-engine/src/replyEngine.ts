import type { AgentConfig, Message, TraceStep } from '@agent-factory/agent-core'
import { nanoid } from 'nanoid'
import { MOCK_COMPANY, MOCK_USER_NAME } from './data'

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

function translationSkillEnabled(config: AgentConfig): boolean {
  return config.capabilities.some(
    (item) => item.type === 'skill' && item.name === '翻译' && item.enabled,
  )
}

function isTranslationRequest(input: string): boolean {
  return (
    input.includes('翻译') ||
    input.includes('英文') ||
    input.includes('英语') ||
    input.toLowerCase().includes('translate')
  )
}

function resolveTargetLanguage(input: string): 'ja' | 'fr' | 'en' {
  if (input.includes('日语') || input.includes('日文')) {
    return 'ja'
  }
  if (input.includes('法语') || input.includes('法文')) {
    return 'fr'
  }
  return 'en'
}

function extractSourceText(input: string): string | null {
  const match = input.match(/[“「"']([^”」"']+)[”」"']/)
  return match?.[1] ?? null
}

function resolveMockTranslation(input: string): string {
  const source = extractSourceText(input)
  if (!source) {
    return '请告诉我要翻译的内容，例如：请把“你好”翻译成英文。'
  }

  const target = resolveTargetLanguage(input)
  if (source.includes('我是智能助手')) {
    if (target === 'ja') {
      return '私はあなたのスマートアシスタントです。'
    }
    if (target === 'fr') {
      return 'Je suis votre assistant intelligent.'
    }
    return 'Hello, I am your intelligent assistant.'
  }
  if (source.includes('你好')) {
    if (target === 'ja') {
      return 'こんにちは。'
    }
    if (target === 'fr') {
      return 'Bonjour.'
    }
    return 'Hello.'
  }
  if (source.includes('谢谢')) {
    if (target === 'ja') {
      return 'ありがとうございます。'
    }
    if (target === 'fr') {
      return 'Merci.'
    }
    return 'Thank you.'
  }
  return '暂时无法翻译这段内容。'
}

function enabledKnowledgeBaseSummary(config: AgentConfig): string {
  const items = config.capabilities.filter((item) => item.type === 'knowledgeBase' && item.enabled)
  if (items.length === 0) {
    return '未接入知识库'
  }
  return items.map((item) => item.name).join('、')
}

function resolvePromptVariables(text: string, config: AgentConfig): string {
  return text
    .replaceAll('{user_name}', MOCK_USER_NAME)
    .replaceAll('{company}', MOCK_COMPANY)
    .replaceAll('{knowledge_base}', enabledKnowledgeBaseSummary(config))
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
    return { messages: [toolMessage, assistantMessage], trace }
  }

  if (!weatherToolEnabled(config) && input.includes('天气')) {
    const assistantMessage = createMessage('assistant', '我没有天气查询能力')
    return { messages: [assistantMessage], trace }
  }

  if (knowledgeBaseEnabled(config) && input.includes('退款')) {
    const assistantMessage = createMessage('assistant', '退款政策支持 7 天内无理由退款。')
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

  if (!knowledgeBaseEnabled(config) && input.includes('退款')) {
    const assistantMessage = createMessage('assistant', '我没有接入知识库，无法回答退款问题')
    return { messages: [assistantMessage], trace }
  }

  if (isTranslationRequest(input)) {
    if (!translationSkillEnabled(config)) {
      const assistantMessage = createMessage('assistant', '我没有翻译能力')
      return { messages: [assistantMessage], trace }
    }

    const assistantMessage = createMessage('assistant', resolveMockTranslation(input))
    trace.push(
      createTraceStep(assistantMessage.id, 'modelOutput', '翻译 Skill', '将用户输入翻译为目标语言'),
    )
    return { messages: [assistantMessage], trace }
  }

  const assistantMessage = input.includes('你是谁')
    ? createMessage('assistant', resolvePromptVariables(config.systemPrompt, config).slice(0, 40))
    : createMessage('assistant', resolvePromptVariables(config.firstMessage, config))

  return { messages: [assistantMessage], trace }
}
