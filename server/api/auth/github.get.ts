import { randomUUID } from 'node:crypto'

const STATE_COOKIE = 'iprep_oauth_state'
const STATE_MAX_AGE = 60 * 10 // 10 minutes

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const state = randomUUID()

  setCookie(event, STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STATE_MAX_AGE,
    path: '/'
  })

  const redirectUri = `${config.public.appUrl}/api/auth/github/callback`
  const authorizeUrl = new URL('https://github.com/login/oauth/authorize')
  authorizeUrl.searchParams.set('client_id', config.githubClientId)
  authorizeUrl.searchParams.set('redirect_uri', redirectUri)
  authorizeUrl.searchParams.set('state', state)

  return sendRedirect(event, authorizeUrl.toString())
})
