export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing user id' })
  }

  const body = await readBody<{ role?: 'user' | 'admin' }>(event)
  if (body?.role !== 'user' && body?.role !== 'admin') {
    throw createError({ statusCode: 400, statusMessage: 'role must be "user" or "admin"' })
  }

  const target = await getUserById(id)
  if (!target) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  if (target._id.toString() === admin._id.toString() && body.role === 'user') {
    const remainingAdmins = await countAdmins(admin._id.toString())
    if (remainingAdmins === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Cannot demote the last remaining admin' })
    }
  }

  const updated = await updateUserRole(id, body.role)
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return {
    id: updated._id.toString(),
    login: updated.login,
    name: updated.name,
    avatarUrl: updated.avatarUrl,
    role: updated.role,
    createdAt: updated.createdAt,
    lastLoginAt: updated.lastLoginAt
  }
})
