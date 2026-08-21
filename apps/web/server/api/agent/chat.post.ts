import type { AgentConfig } from '@agent-factory/agent-core'
import { buildMockReply } from '@agent-factory/mock-engine'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ input: string; config: AgentConfig }>(event)
  return buildMockReply(body.input, body.config)
})
