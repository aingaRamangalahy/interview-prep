import { listQuestions } from '../../utils/questions'

export default defineEventHandler(async (event) => {
  const user = await getOptionalUser(event)
  return listQuestions({ includeArchived: user?.role === 'admin' })
})
