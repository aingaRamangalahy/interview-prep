export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing question id' })
  }

  const deleted = await deleteQuestionBySlug(id)
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Question not found' })
  }

  return { ok: true }
})
