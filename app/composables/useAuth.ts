import type { AuthUser } from '~/types'

export async function fetchAuthUser(): Promise<AuthUser | null> {
  // Plain $fetch does not forward the browser's cookies to Nitro's internal
  // API calls during SSR, so a fresh/hard page load would always see
  // "signed out" regardless of the real session. useRequestFetch() forwards
  // the incoming request's headers server-side, and behaves like normal
  // $fetch on the client.
  const requestFetch = useRequestFetch()
  const data = await requestFetch<{ user: AuthUser | null }>('/api/auth/me')
  return data.user ?? null
}

export function useAuth() {
  const { data: user, pending, refresh } = useAsyncData<AuthUser | null>('auth-me', fetchAuthUser, {
    default: () => null
  })

  const role = computed(() => user.value?.role ?? null)
  const isVisitor = computed(() => !user.value)
  const isUser = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function signIn() {
    if (import.meta.client) window.location.href = '/api/auth/github'
  }

  async function signOut() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await refresh()
  }

  return {
    user,
    pending,
    role,
    isVisitor,
    isUser,
    isAdmin,
    refresh,
    signIn,
    signOut
  }
}
