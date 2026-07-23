export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing user id' })
  }

  const target = await getUserById(id)
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  if (target.role === 'admin') {
    const remainingAdmins = await countAdmins(target._id.toString())
    if (remainingAdmins === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Cannot remove the last remaining admin' })
    }
  }

  await deleteUserState(target._id.toString())
  await deleteUserById(target._id.toString())

  if (target._id.toString() === admin._id.toString()) {
    const session = await getAuthSession(event)
    await session.clear()
  }

  return { ok: true }
})
