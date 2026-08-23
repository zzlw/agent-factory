import type { AgentConfig, AgentSnapshot } from '@agent-factory/agent-core'

export const MODEL_OPTIONS = [
  'gpt-4.1-mini',
  'gpt-4.1',
  'gpt-4o-mini',
  'claude-4.5-sonnet',
  'gemini-2.5-flash',
] as const

export const VOICE_OPTIONS = ['Alloy', 'Shimmer', 'Echo', 'Fable', 'Onyx'] as const

export const MOCK_USER_NAME = '演示用户'
export const MOCK_COMPANY = '演示公司'

const v1Config: AgentConfig = {
  name: '客服助手',
  description: '处理常见问题的智能助手',
  systemPrompt: '我是一个 AI 客服助手，只回答用户关于产品和天气的问题。',
  firstMessage: '你好，我是你的智能助手，有什么可以帮你？',
  model: 'gpt-4.1-mini',
  temperature: 0.7,
  voice: {
    name: 'Alloy',
    enabled: true,
  },
  capabilities: [
    {
      id: 'tool-weather',
      type: 'tool',
      name: '天气查询',
      description: '查询指定城市的实时天气',
      enabled: false,
      integration: 'mcp',
    },
    {
      id: 'skill-translate',
      type: 'skill',
      name: '翻译',
      description: '在多种语言之间进行翻译',
      enabled: false,
      integration: 'builtin',
    },
    {
      id: 'kb-refund',
      type: 'knowledgeBase',
      name: '退款政策知识库',
      description: '公司退款政策与常见退款问题',
      enabled: true,
      integration: 'builtin',
    },
  ],
}

export const initialAgentConfig: AgentConfig = {
  ...v1Config,
  description: '处理常见问题与天气查询的智能助手',
  capabilities: [
    {
      id: 'tool-weather',
      type: 'tool',
      name: '天气查询',
      description: '查询指定城市的实时天气',
      enabled: true,
      integration: 'mcp',
    },
    {
      id: 'skill-translate',
      type: 'skill',
      name: '翻译',
      description: '在多种语言之间进行翻译',
      enabled: true,
      integration: 'builtin',
    },
    {
      id: 'kb-refund',
      type: 'knowledgeBase',
      name: '退款政策知识库',
      description: '公司退款政策与常见退款问题',
      enabled: true,
      integration: 'builtin',
    },
  ],
}

export const initialVersion = 2

export const initialPublishHistory: AgentSnapshot[] = [
  {
    config: v1Config,
    savedAt: '2026-08-18T10:00:00.000Z',
    publishedAt: '2026-08-18T10:05:00.000Z',
    version: 1,
    changelog: '首个可用版本',
  },
  {
    config: initialAgentConfig,
    savedAt: '2026-08-20T09:00:00.000Z',
    publishedAt: '2026-08-20T09:10:00.000Z',
    version: 2,
    changelog: '启用天气查询能力',
  },
]
