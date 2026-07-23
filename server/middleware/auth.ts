export default defineEventHandler(async (event) => {
  const session = await getAuthSession(event)
  event.context.auth = session.data.userId ? { userId: session.data.userId } : null
})
