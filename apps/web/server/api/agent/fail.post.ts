export default defineEventHandler(async (event) => {
  const body = await readBody<{ enabled?: boolean }>(event)
  if (body.enabled !== false) {
    armMockFail()
  }
  return { ok: true }
})
