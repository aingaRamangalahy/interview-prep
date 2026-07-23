import type { AppState } from '~/types'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<AppState>(event)

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid state payload' })
  }

  return saveUserState(user._id.toString(), body)
})
