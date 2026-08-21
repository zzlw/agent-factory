export default defineEventHandler(async (event) => {
  await readBody(event)
  if (consumeMockFail()) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: '模拟保存失败',
    })
  }
  return { ok: true }
})
