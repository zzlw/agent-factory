export default defineEventHandler(async (event) => {
  await readBody(event)
  if (consumeMockFail()) {
    throw createError({
      statusCode: 500,
      statusMessage: '模拟发布失败',
    })
  }
  return { ok: true }
})
