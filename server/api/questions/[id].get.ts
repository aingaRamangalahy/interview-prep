import { getQuestionBySlug } from '../../utils/questions'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing question id' })
  }

  const question = await getQuestionBySlug(id)
  if (!question) {
    throw createError({ statusCode: 404, statusMessage: 'Question not found' })
  }

  const user = await getOptionalUser(event)
  if (question.status === 'archived' && user?.role !== 'admin') {
    throw createError({ statusCode: 404, statusMessage: 'Question not found' })
  }

  return question
})
