import type { TestScenario } from '@agent-factory/agent-core'

export const testScenarios: TestScenario[] = [
  {
    id: 'capability',
    label: '测试能力',
    input: '北京今天天气怎么样？',
    description: '验证天气 Tool 开关是否生效',
    assertion: {
      requiresCapability: '天气查询',
      mustCallTool: '天气查询',
      replyContains: '天气',
    },
  },
  {
    id: 'knowledge',
    label: '测试知识库',
    input: '退款政策是什么？',
    description: '验证 Knowledge Base 开关是否生效',
    assertion: {
      requiresCapability: '退款政策知识库',
      replyContains: '退款',
    },
  },
  {
    id: 'persona',
    label: '测试人设',
    input: '你是谁？',
    description: '验证 System Prompt 是否被引用',
    assertion: {
      replyContains: '我是一个 AI 客服助手',
    },
  },
  {
    id: 'fallback',
    label: '测试兜底',
    input: '随便聊聊',
    description: '验证 First Message 兜底回复',
    assertion: {
      replyContains: '智能助手',
    },
  },
]
