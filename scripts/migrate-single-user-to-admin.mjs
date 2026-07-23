#!/usr/bin/env node
/**
 * Moves today's single legacy `user_states` document (keyed by APP_USER_ID,
 * default "default") to the bootstrap admin account's `users._id`.
 *
 * Copies rather than renames-in-place: the legacy document is left untouched
 * as a rollback point. Safe to re-run — it aborts instead of clobbering an
 * existing destination document unless --force is passed.
 *
 * Usage:
 *   node scripts/migrate-single-user-to-admin.mjs
 *   node scripts/migrate-single-user-to-admin.mjs --dry-run
 *   node scripts/migrate-single-user-to-admin.mjs --login=someone
 *   node scripts/migrate-single-user-to-admin.mjs --force
 */

import { MongoClient } from 'mongodb'

const args = process.argv.slice(2)
const flags = new Set(args.filter(arg => !arg.includes('=')))
const options = Object.fromEntries(
  args
    .filter(arg => arg.includes('='))
    .map((arg) => {
      const [key, ...rest] = arg.split('=')
      return [key.replace(/^--/, ''), rest.join('=')]
    })
)

const dryRun = flags.has('--dry-run')
const force = flags.has('--force')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI is required. Set it in .env or pass it inline:')
  console.error('  MONGODB_URI="mongodb+srv://..." pnpm migrate:admin-user')
  process.exit(1)
}

const legacyUserId = process.env.APP_USER_ID || 'default'
const adminLoginsRaw = options.login || process.env.ADMIN_GITHUB_LOGINS || ''
const adminLogin = adminLoginsRaw.split(',').map(l => l.trim()).filter(Boolean)[0]

if (!adminLogin) {
  console.error('No admin login to migrate to. Set ADMIN_GITHUB_LOGINS or pass --login=<github-username>.')
  process.exit(1)
}

function summarize(doc, label) {
  if (!doc) {
    console.log(`  ${label}: (none)`)
    return
  }
  const state = doc.state || {}
  const reviewsCount = Object.keys(state.reviews || {}).length
  const sessionsCount = (state.sessions || []).length
  console.log(`  ${label}: userId=${doc.userId} reviews=${reviewsCount} sessions=${sessionsCount} currentStreak=${state.currentStreak ?? 0} longestStreak=${state.longestStreak ?? 0} updatedAt=${doc.updatedAt?.toISOString?.() ?? doc.updatedAt}`)
}

async function main() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()

  try {
    const db = client.db()
    const users = db.collection('users')
    const userStates = db.collection('user_states')

    const adminUser = await users.findOne({ login: adminLogin })
    if (!adminUser) {
      console.error(`No users document found for login "${adminLogin}". Sign in with that GitHub account first.`)
      process.exit(1)
    }
    if (adminUser.role !== 'admin') {
      console.error(`User "${adminLogin}" exists but role is "${adminUser.role}", not "admin". Refusing to migrate.`)
      process.exit(1)
    }

    const adminUserId = adminUser._id.toString()
    console.log(`Admin account: login=${adminUser.login} _id=${adminUserId}`)

    const legacyDoc = await userStates.findOne({ userId: legacyUserId })
    if (!legacyDoc) {
      console.log(`Nothing to migrate — no user_states document for userId="${legacyUserId}".`)
      return
    }

    const existingAdminDoc = await userStates.findOne({ userId: adminUserId })

    console.log('Summary:')
    summarize(legacyDoc, `source (userId="${legacyUserId}")`)
    summarize(existingAdminDoc, `destination (userId="${adminUserId}")`)

    if (existingAdminDoc && !force) {
      console.error('')
      console.error(`A user_states document already exists for the admin (${adminUserId}).`)
      console.error('Refusing to overwrite. Re-run with --force to replace it with the legacy document, or resolve manually.')
      process.exit(1)
    }

    const mergedState = {
      ...legacyDoc.state,
      mutedQuestionIds: legacyDoc.state?.mutedQuestionIds ?? []
    }

    if (dryRun) {
      console.log('')
      console.log(`Dry run: would ${existingAdminDoc ? 'overwrite (--force)' : 'insert'} user_states for userId="${adminUserId}". No changes made.`)
      return
    }

    const now = new Date()
    await userStates.updateOne(
      { userId: adminUserId },
      {
        $set: { state: mergedState, updatedAt: now },
        $setOnInsert: { userId: adminUserId }
      },
      { upsert: true }
    )

    const written = await userStates.findOne({ userId: adminUserId })
    console.log('')
    console.log('Migration complete.')
    summarize(written, `destination (userId="${adminUserId}") [after]`)
    console.log('')
    console.log(`The legacy document (userId="${legacyUserId}") was left untouched as a rollback copy.`)
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
