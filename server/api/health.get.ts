import { getDb } from '../utils/db'

export default defineEventHandler(async () => {
  try {
    await getDb()
    return { status: 'ok', database: 'connected' }
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Database unavailable' })
  }
})
