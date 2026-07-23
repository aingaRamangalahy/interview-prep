export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return getUserState(user._id.toString())
})
