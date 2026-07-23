export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing question id' })
  }

  const body = await readBody<{ status?: 'active' | 'archived' }>(event)
  if (body?.status !== 'active' && body?.status !== 'archived') {
    throw createError({ statusCode: 400, statusMessage: 'status must be "active" or "archived"' })
  }

  const updated = await setQuestionStatus(id, body.status, admin._id.toString())
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Question not found' })
  }

  return updated
})
