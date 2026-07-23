export default defineEventHandler(async (event) => {
  const user = await getOptionalUser(event)

  // Bare `return null` becomes HTTP 204, and $fetch then yields `undefined`
  // (breaks useAsyncData). Always return JSON.
  return {
    user: user
      ? {
          id: user._id.toString(),
          login: user.login,
          name: user.name,
          avatarUrl: user.avatarUrl,
          role: user.role
        }
      : null
  }
})
