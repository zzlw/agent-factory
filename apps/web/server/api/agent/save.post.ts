export default defineEventHandler(async (event) => {
  await readBody(event)
  return { ok: true }
})
