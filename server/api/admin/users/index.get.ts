export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const users = await listUsers()
  return users.map(user => ({
    id: user._id.toString(),
    login: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  }))
})
