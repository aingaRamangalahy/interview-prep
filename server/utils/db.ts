import type { Db } from 'mongodb'
import { MongoClient } from 'mongodb'

declare global {

  var __mongoClient: MongoClient | undefined

  var __mongoDb: Db | undefined

  var __mongoIndexesReady: boolean | undefined
}

let indexesPromise: Promise<void> | null = null

export async function getDb(): Promise<Db> {
  if (global.__mongoDb) return global.__mongoDb

  const config = useRuntimeConfig()
  if (!config.mongodbUri) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MONGODB_URI is not configured'
    })
  }

  if (!global.__mongoClient) {
    global.__mongoClient = new MongoClient(config.mongodbUri, {
      maxPoolSize: 10
    })
    await global.__mongoClient.connect()
  }

  global.__mongoDb = global.__mongoClient.db()
  await ensureIndexes(global.__mongoDb)
  return global.__mongoDb
}

async function ensureIndexes(database: Db) {
  if (global.__mongoIndexesReady) return
  if (!indexesPromise) {
    indexesPromise = (async () => {
      await database.collection('questions').createIndex({ slug: 1 }, { unique: true })
      await database.collection('questions').createIndex({ subcategory: 1, difficulty: 1 })
      await database.collection('user_states').createIndex({ userId: 1 }, { unique: true })
      await database.collection('users').createIndex({ githubId: 1 }, { unique: true })
      global.__mongoIndexesReady = true
    })()
  }
  await indexesPromise
}

export async function closeDb() {
  if (global.__mongoClient) {
    await global.__mongoClient.close()
    global.__mongoClient = undefined
    global.__mongoDb = undefined
    global.__mongoIndexesReady = undefined
    indexesPromise = null
  }
}
