import { listQuestions } from '../../utils/questions'

export default defineEventHandler(async () => {
  return listQuestions()
})
