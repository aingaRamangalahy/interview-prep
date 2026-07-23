#!/usr/bin/env node
/**
 * One-time cleanup: the original content migration computed slugs relative to
 * a `content/questions/...` folder, so every question slug ended up with a
 * redundant leading "questions/" segment (e.g. "questions/javascript/foo").
 * Combined with the `/questions/[...slug]` route, this produces ugly,
 * duplicate-looking URLs like `/questions/questions/javascript/foo` — bad for
 * SEO and confusing for users/backlinks.
 *
 * This strips the redundant leading "questions/" segment from every slug in
 * the `questions` collection, and remaps any references to the old slug in
 * `user_states` (state.reviews keys, state.mutedQuestionIds entries) so
 * existing progress/mutes aren't orphaned.
 *
 * Safe to re-run — questions without the redundant prefix are left untouched.
 *
 * Usage:
 *   node scripts/fix-question-slugs.mjs --dry-run
 *   node scripts/fix-question-slugs.mjs
 */

import { MongoClient } from 'mongodb'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI is required. Set it in .env or pass it inline:')
  console.error('  MONGODB_URI="mongodb+srv://..." pnpm fix:question-slugs')
  process.exit(1)
}

const REDUNDANT_PREFIX = /^questions\//

async function main() {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()

  try {
    const db = client.db()
    const questions = db.collection('questions')
    const userStates = db.collection('user_states')

    const docs = await questions.find({}, { projection: { slug: 1 } }).toArray()
    const renames = docs
      .filter(doc => REDUNDANT_PREFIX.test(doc.slug))
      .map(doc => ({ oldSlug: doc.slug, newSlug: doc.slug.replace(REDUNDANT_PREFIX, '') }))

    if (renames.length === 0) {
      console.log('Nothing to do — no slugs have the redundant "questions/" prefix.')
      return
    }

    console.log(`Found ${renames.length} slug(s) to fix:`)
    for (const { oldSlug, newSlug } of renames) {
      console.log(`  ${oldSlug}  ->  ${newSlug}`)
    }

    for (const { newSlug } of renames) {
      const collision = await questions.findOne({ slug: newSlug }, { projection: { _id: 1 } })
      if (collision) {
        console.error(`\nAborting: target slug "${newSlug}" already exists. Resolve manually.`)
        process.exit(1)
      }
    }

    const renameMap = new Map(renames.map(r => [r.oldSlug, r.newSlug]))

    if (dryRun) {
      console.log('\nDry run: no changes made.')
      return
    }

    for (const { oldSlug, newSlug } of renames) {
      await questions.updateOne({ slug: oldSlug }, { $set: { slug: newSlug } })
    }
    console.log(`\nUpdated ${renames.length} question slug(s).`)

    const stateDocs = await userStates.find({}).toArray()
    let touchedStates = 0

    for (const doc of stateDocs) {
      const state = doc.state || {}
      let changed = false

      if (state.reviews && typeof state.reviews === 'object') {
        const nextReviews = {}
        for (const [questionId, review] of Object.entries(state.reviews)) {
          const mapped = renameMap.get(questionId) ?? questionId
          if (mapped !== questionId) changed = true
          nextReviews[mapped] = review && review.questionId === questionId
            ? { ...review, questionId: mapped }
            : review
        }
        state.reviews = nextReviews
      }

      if (Array.isArray(state.mutedQuestionIds)) {
        const nextMuted = state.mutedQuestionIds.map(id => renameMap.get(id) ?? id)
        if (nextMuted.some((id, i) => id !== state.mutedQuestionIds[i])) changed = true
        state.mutedQuestionIds = nextMuted
      }

      if (changed) {
        await userStates.updateOne({ _id: doc._id }, { $set: { state, updatedAt: new Date() } })
        touchedStates += 1
      }
    }

    console.log(`Updated ${touchedStates} user_states document(s) with remapped question ids.`)
    console.log('\nDone.')
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
