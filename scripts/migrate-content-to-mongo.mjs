#!/usr/bin/env node
/**
 * Migrates Markdown questions from content/questions/ into MongoDB.
 * Optionally removes the content/ directory and content.config.ts.
 *
 * Usage:
 *   node scripts/migrate-content-to-mongo.mjs
 *   node scripts/migrate-content-to-mongo.mjs --keep-files
 *   node scripts/migrate-content-to-mongo.mjs --dry-run
 */

import { readdir, readFile, rm, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { MongoClient } from 'mongodb'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = join(__dirname, '..')
const CONTENT_DIR = join(ROOT, 'content', 'questions')

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const keepFiles = args.has('--keep-files')

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI is required. Set it in .env or pass it inline.')
  process.exit(1)
}

const VALID_CATEGORIES = new Set(['technical', 'non-technical'])
const VALID_DIFFICULTIES = new Set(['easy', 'medium', 'hard'])

async function collectMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectMarkdownFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

function toSlug(filePath) {
  const rel = relative(join(ROOT, 'content'), filePath).replace(/\.md$/, '')
  return rel.replace(/\\/g, '/')
}

function validateQuestion(slug, data) {
  const errors = []

  if (!data.title) errors.push('missing title')
  if (!VALID_CATEGORIES.has(data.category)) errors.push(`invalid category: ${data.category}`)
  if (!data.subcategory) errors.push('missing subcategory')
  if (!VALID_DIFFICULTIES.has(data.difficulty)) errors.push(`invalid difficulty: ${data.difficulty}`)

  if (errors.length) {
    throw new Error(`${slug}: ${errors.join(', ')}`)
  }

  return {
    slug,
    title: data.title,
    category: data.category,
    subcategory: data.subcategory,
    difficulty: data.difficulty,
    hint: data.hint || undefined,
    tags: Array.isArray(data.tags) ? data.tags : [],
    source: data.source || undefined,
    notes: data.notes || undefined,
    answer: data.content.trim()
  }
}

async function main() {
  try {
    await stat(CONTENT_DIR)
  } catch {
    console.log('No content/questions directory found — nothing to migrate.')
    return
  }

  const files = await collectMarkdownFiles(CONTENT_DIR)
  if (files.length === 0) {
    console.log('No Markdown files found in content/questions.')
    return
  }

  const questions = []
  for (const file of files) {
    const raw = await readFile(file, 'utf8')
    const parsed = matter(raw)
    const slug = toSlug(file)
    questions.push(validateQuestion(slug, { ...parsed.data, content: parsed.content }))
  }

  console.log(`Found ${questions.length} questions to migrate.`)

  if (dryRun) {
    questions.forEach(q => console.log(`  - ${q.slug}`))
    console.log('Dry run complete. No database or file changes made.')
    return
  }

  const client = new MongoClient(MONGODB_URI)
  await client.connect()
  const db = client.db()
  const collection = db.collection('questions')
  const now = new Date()

  let upserted = 0
  for (const question of questions) {
    await collection.updateOne(
      { slug: question.slug },
      {
        $set: { ...question, updatedAt: now },
        $setOnInsert: { createdAt: now }
      },
      { upsert: true }
    )
    upserted++
    console.log(`  ✓ ${question.slug}`)
  }

  await collection.createIndex({ slug: 1 }, { unique: true })
  await collection.createIndex({ subcategory: 1, difficulty: 1 })
  await client.close()

  console.log(`Migrated ${upserted} questions to MongoDB.`)

  if (!keepFiles) {
    await rm(join(ROOT, 'content'), { recursive: true, force: true })
    await rm(join(ROOT, 'content.config.ts'), { force: true })
    console.log('Removed content/ and content.config.ts')
  } else {
    console.log('Kept content files (--keep-files).')
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
