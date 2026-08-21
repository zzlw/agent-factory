export type AgentStatus = 'draft' | 'saved' | 'published'

export type CapabilityType = 'tool' | 'skill' | 'knowledgeBase'

export interface Capability {
  id: string
  type: CapabilityType
  name: string
  description: string
  enabled: boolean
  integration: 'mcp' | 'builtin' | 'custom'
}

export interface AgentConfig {
  name: string
  description: string
  systemPrompt: string
  firstMessage: string
  model: string
  temperature: number
  voice: { name: string; enabled: boolean }
  capabilities: Capability[]
}

export type MessageRole = 'user' | 'assistant' | 'tool'

export interface ToolCall {
  name: string
  args: string
  result: string
}

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: string
  streaming?: boolean
  toolCall?: ToolCall
}

export type TraceStepType = 'input' | 'knowledgeBase' | 'toolCall' | 'modelOutput' | 'finalOutput'

export type TraceStepStatus = 'success' | 'failed' | 'pending'

export interface TraceStep {
  id: string
  messageId: string
  type: TraceStepType
  title: string
  detail: string
  status: TraceStepStatus
  createdAt: string
}

export interface ScenarioAssertion {
  requiresCapability?: string
  mustCallTool?: string
  replyContains?: string
}

export interface TestScenario {
  id: string
  label: string
  input: string
  description: string
  assertion: ScenarioAssertion
}

export interface AgentSnapshot {
  config: AgentConfig
  savedAt: string | null
  publishedAt: string | null
  version: number
  changelog?: string
}
