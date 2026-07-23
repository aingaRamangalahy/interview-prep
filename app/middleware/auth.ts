export default defineNuxtRouteMiddleware(async (to) => {
  const { data: user } = await useAsyncData('auth-me', fetchAuthUser, { default: () => null })

  if (!user.value) {
    return navigateTo('/')
  }

  if (to.path.startsWith('/admin') && user.value.role !== 'admin') {
    return navigateTo('/')
  }
})
