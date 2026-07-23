import type { H3Event } from 'h3'
import { getUserById, type UserDocument } from './users'

declare module 'h3' {
  interface H3EventContext {
    auth: { userId: string } | null
  }
}

interface AuthSessionData {
  userId?: string
}

const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function getAuthSession(event: H3Event) {
  const config = useRuntimeConfig()
  // h3 defaults cookie.secure=true, which browsers refuse on http://localhost.
  const secure = String(config.public.appUrl || '').startsWith('https://')

  return useSession<AuthSessionData>(event, {
    password: config.authSessionSecret,
    name: 'iprep_session',
    maxAge: SESSION_MAX_AGE,
    cookie: {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/'
    }
  })
}

/** Resolves the current user from `event.context.auth` without throwing. */
export async function getOptionalUser(event: H3Event): Promise<UserDocument | null> {
  const userId = event.context.auth?.userId
  if (!userId) return null
  return getUserById(userId)
}

export async function requireUser(event: H3Event): Promise<UserDocument> {
  const user = await getOptionalUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  return user
}

export async function requireAdmin(event: H3Event): Promise<UserDocument> {
  const user = await requireUser(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  return user
}
