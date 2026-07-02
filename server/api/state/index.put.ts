import type { AppState } from '~/types'
import { saveUserState } from '../../utils/user-state'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<AppState>(event)

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid state payload' })
  }

  return saveUserState(config.appUserId, body)
})
