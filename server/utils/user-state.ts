import type { AppState } from '~/types'
import { getDb } from './db'

export interface UserStateDocument {
  userId: string
  state: AppState
  updatedAt: Date
}

const DEFAULT_STATE: AppState = {
  reviews: {},
  sessions: [],
  lastSessionDate: null,
  currentStreak: 0,
  longestStreak: 0,
  settings: {
    sessionSize: 5,
    defaultPracticeMode: 'mixed',
    customSubcategories: ['javascript', 'vue', 'behavioral']
  },
  mutedQuestionIds: []
}

export async function getUserState(userId: string): Promise<AppState> {
  const database = await getDb()
  const doc = await database
    .collection<UserStateDocument>('user_states')
    .findOne({ userId })

  if (!doc) return { ...DEFAULT_STATE }
  return { ...DEFAULT_STATE, ...doc.state }
}

export async function deleteUserState(userId: string): Promise<void> {
  const database = await getDb()
  await database.collection<UserStateDocument>('user_states').deleteOne({ userId })
}

export async function saveUserState(userId: string, state: AppState): Promise<AppState> {
  const database = await getDb()
  const now = new Date()

  await database.collection<UserStateDocument>('user_states').updateOne(
    { userId },
    {
      $set: { state, updatedAt: now },
      $setOnInsert: { userId }
    },
    { upsert: true }
  )

  return state
}
