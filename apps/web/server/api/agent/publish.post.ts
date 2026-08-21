import { validateAgentConfig } from '@agent-factory/agent-core'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ config?: unknown; changelog?: string }>(event)
  const validation = validateAgentConfig(body.config)
  if (!validation.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: validation.message,
    })
  }
  if (consumeMockFail()) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: '模拟发布失败',
    })
  }
  return { ok: true }
})
