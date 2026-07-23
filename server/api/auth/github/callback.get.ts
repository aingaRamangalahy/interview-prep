const STATE_COOKIE = 'iprep_oauth_state'

interface GithubTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

interface GithubUserResponse {
  id: number
  login: string
  name: string | null
  avatar_url: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const code = typeof query.code === 'string' ? query.code : ''
  const state = typeof query.state === 'string' ? query.state : ''
  const cookieState = getCookie(event, STATE_COOKIE)

  deleteCookie(event, STATE_COOKIE, { path: '/' })

  if (!code || !state || !cookieState || state !== cookieState) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired OAuth state' })
  }

  const redirectUri = `${config.public.appUrl}/api/auth/github/callback`

  const tokenResponse = await $fetch<GithubTokenResponse>('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: {
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
      redirect_uri: redirectUri
    }
  })

  if (!tokenResponse.access_token) {
    throw createError({ statusCode: 401, statusMessage: 'GitHub OAuth token exchange failed' })
  }

  const profile = await $fetch<GithubUserResponse>('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokenResponse.access_token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'interview-prep-app'
    }
  })

  const user = await upsertUserFromGithub({
    githubId: profile.id,
    login: profile.login,
    name: profile.name ?? undefined,
    avatarUrl: profile.avatar_url
  })

  const session = await getAuthSession(event)
  await session.update({ userId: user._id.toString() })

  return sendRedirect(event, '/')
})
