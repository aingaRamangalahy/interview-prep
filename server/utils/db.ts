import type { Db } from 'mongodb'
import { MongoClient } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export async function getDb(): Promise<Db> {
  if (db) return db

  const config = useRuntimeConfig()
  if (!config.mongodbUri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MONGODB_URI is not configured'
    })
  }

  client = new MongoClient(config.mongodbUri)
  await client.connect()
  db = client.db()

  await ensureIndexes(db)
  return db
}

async function ensureIndexes(database: Db) {
  await database.collection('questions').createIndex({ slug: 1 }, { unique: true })
  await database.collection('questions').createIndex({ subcategory: 1, difficulty: 1 })
  await database.collection('user_states').createIndex({ userId: 1 }, { unique: true })
}

export async function closeDb() {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
