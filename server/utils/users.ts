import { ObjectId } from 'mongodb'
import { getDb } from './db'

export type UserRole = 'user' | 'admin'

export interface UserDocument {
  _id: ObjectId
  githubId: number
  login: string
  name?: string
  avatarUrl?: string
  role: UserRole
  createdAt: Date
  lastLoginAt: Date
}

export interface GithubProfile {
  githubId: number
  login: string
  name?: string
  avatarUrl?: string
}

function isBootstrapAdmin(login: string, adminLogins: string): boolean {
  const allowlist = adminLogins
    .split(',')
    .map(entry => entry.trim().toLowerCase())
    .filter(Boolean)

  return allowlist.includes(login.toLowerCase())
}

export async function upsertUserFromGithub(profile: GithubProfile): Promise<UserDocument> {
  const database = await getDb()
  const config = useRuntimeConfig()
  const collection = database.collection<UserDocument>('users')
  const now = new Date()
  const role: UserRole = isBootstrapAdmin(profile.login, config.adminGithubLogins) ? 'admin' : 'user'

  await collection.updateOne(
    { githubId: profile.githubId },
    {
      $set: {
        login: profile.login,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        lastLoginAt: now
      },
      $setOnInsert: {
        githubId: profile.githubId,
        role,
        createdAt: now
      }
    },
    { upsert: true }
  )

  const user = await collection.findOne({ githubId: profile.githubId })
  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to create or update user' })
  }

  return user
}

export async function getUserById(id: string): Promise<UserDocument | null> {
  if (!ObjectId.isValid(id)) return null

  const database = await getDb()
  return database.collection<UserDocument>('users').findOne({ _id: new ObjectId(id) })
}

export async function getUserByLogin(login: string): Promise<UserDocument | null> {
  const database = await getDb()
  return database.collection<UserDocument>('users').findOne({ login })
}

export async function listUsers(): Promise<UserDocument[]> {
  const database = await getDb()
  return database.collection<UserDocument>('users').find().sort({ createdAt: 1 }).toArray()
}

export async function countAdmins(excludingId?: string): Promise<number> {
  const database = await getDb()
  const filter: Record<string, unknown> = { role: 'admin' }
  if (excludingId) filter._id = { $ne: new ObjectId(excludingId) }
  return database.collection<UserDocument>('users').countDocuments(filter)
}

export async function updateUserRole(id: string, role: UserRole): Promise<UserDocument | null> {
  if (!ObjectId.isValid(id)) return null

  const database = await getDb()
  const result = await database.collection<UserDocument>('users').findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { role } },
    { returnDocument: 'after' }
  )

  return result
}

export async function deleteUserById(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false

  const database = await getDb()
  const result = await database.collection<UserDocument>('users').deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount > 0
}
