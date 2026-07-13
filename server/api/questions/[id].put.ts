import { updateQuestionBySlug } from '../../utils/questions'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing question id' })
  }

  const body = await readBody<{
    title?: string
    hint?: string | null
    answer?: string
  }>(event)

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const hasTitle = typeof body.title === 'string'
  const hasAnswer = typeof body.answer === 'string'
  const hasHint = typeof body.hint === 'string' || body.hint === null

  if (!hasTitle && !hasAnswer && !hasHint) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one field (title, hint, answer) is required'
    })
  }

  const title = hasTitle ? body.title!.trim() : undefined
  const answer = hasAnswer ? body.answer!.trim() : undefined
  let hint: string | null | undefined
  if (hasHint) {
    if (body.hint === null) hint = null
    else if (typeof body.hint === 'string') hint = body.hint.trim()
  }

  if (title !== undefined && !title) {
    throw createError({ statusCode: 400, statusMessage: 'Title cannot be empty' })
  }

  if (answer !== undefined && !answer) {
    throw createError({ statusCode: 400, statusMessage: 'Answer cannot be empty' })
  }

  const updated = await updateQuestionBySlug(id, { title, hint, answer })
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Question not found' })
  }

  return updated
})
