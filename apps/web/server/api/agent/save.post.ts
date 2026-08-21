import { validateAgentConfig } from '@agent-factory/agent-core'

export default defineEventHandler(async (event) => {
  const body = await readBody<unknown>(event)
  const validation = validateAgentConfig(body)
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
      message: '模拟保存失败',
    })
  }
  return { ok: true }
})
