import type { Category, Difficulty, Question, Subcategory } from '~/types'
import { getCategoryForSubcategory } from '~/utils/categories'
import { getDb } from './db'

export interface QuestionDocument {
  slug: string
  title: string
  category: Category
  subcategory: Subcategory
  difficulty: Difficulty
  hint?: string
  tags: string[]
  source?: string
  notes?: string
  answer: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateQuestionInput {
  slug?: string
  title: string
  subcategory: Subcategory
  difficulty: Difficulty
  hint?: string
  answer: string
  tags?: string[]
  source?: string
  notes?: string
}

function toQuestion(doc: QuestionDocument): Question {
  return {
    id: doc.slug,
    title: doc.title,
    category: doc.category,
    subcategory: doc.subcategory,
    difficulty: doc.difficulty,
    hint: doc.hint,
    tags: doc.tags ?? [],
    source: doc.source,
    notes: doc.notes,
    answer: doc.answer,
    path: `/${doc.slug}`
  }
}

export async function listQuestions(): Promise<Question[]> {
  const database = await getDb()
  const docs = await database
    .collection<QuestionDocument>('questions')
    .find()
    .sort({ subcategory: 1, title: 1 })
    .toArray()

  return docs.map(toQuestion)
}

export async function getQuestionBySlug(slug: string): Promise<Question | null> {
  const database = await getDb()
  const doc = await database
    .collection<QuestionDocument>('questions')
    .findOne({ slug })

  return doc ? toQuestion(doc) : null
}

export async function upsertQuestion(
  input: Omit<QuestionDocument, 'createdAt' | 'updatedAt'>
) {
  const database = await getDb()
  const now = new Date()

  await database.collection<QuestionDocument>('questions').updateOne(
    { slug: input.slug },
    {
      $set: { ...input, updatedAt: now },
      $setOnInsert: { createdAt: now }
    },
    { upsert: true }
  )
}

export async function updateQuestionBySlug(
  slug: string,
  updates: {
    title?: string
    hint?: string | null
    answer?: string
  }
): Promise<Question | null> {
  const database = await getDb()
  const setFields: Partial<Pick<QuestionDocument, 'title' | 'hint' | 'answer'>> = {}
  const unsetFields: Partial<Record<'hint', ''>> = {}

  if (updates.title !== undefined) setFields.title = updates.title
  if (updates.answer !== undefined) setFields.answer = updates.answer

  if (updates.hint !== undefined) {
    if (!updates.hint) unsetFields.hint = ''
    else setFields.hint = updates.hint
  }

  const hasSet = Object.keys(setFields).length > 0
  const hasUnset = Object.keys(unsetFields).length > 0
  if (!hasSet && !hasUnset) {
    const doc = await database.collection<QuestionDocument>('questions').findOne({ slug })
    return doc ? toQuestion(doc) : null
  }

  const result = await database.collection<QuestionDocument>('questions').findOneAndUpdate(
    { slug },
    {
      $set: { ...setFields, updatedAt: new Date() },
      ...(hasUnset ? { $unset: unsetFields } : {})
    },
    {
      returnDocument: 'after'
    }
  )

  return result ? toQuestion(result) : null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function buildUniqueSlug(base: string): Promise<string> {
  const database = await getDb()
  const collection = database.collection<QuestionDocument>('questions')
  const normalizedBase = base || `question-${Date.now()}`
  let candidate = normalizedBase
  let suffix = 2

  while (await collection.findOne({ slug: candidate }, { projection: { slug: 1 } })) {
    candidate = `${normalizedBase}-${suffix}`
    suffix += 1
  }

  return candidate
}

export async function createOrUpdateQuestions(
  inputs: CreateQuestionInput[]
): Promise<{ created: number, updated: number, questions: Question[] }> {
  const database = await getDb()
  const collection = database.collection<QuestionDocument>('questions')
  const now = new Date()
  const output: Question[] = []
  let created = 0
  let updated = 0

  for (const input of inputs) {
    const desiredSlug = input.slug?.trim()
    const slug = desiredSlug
      ? slugify(desiredSlug)
      : await buildUniqueSlug(slugify(input.title))
    const existing = await collection.findOne({ slug }, { projection: { slug: 1 } })

    await collection.updateOne(
      { slug },
      {
        $set: {
          slug,
          title: input.title,
          category: getCategoryForSubcategory(input.subcategory),
          subcategory: input.subcategory,
          difficulty: input.difficulty,
          hint: input.hint,
          tags: input.tags ?? [],
          source: input.source,
          notes: input.notes,
          answer: input.answer,
          updatedAt: now
        },
        $setOnInsert: {
          createdAt: now
        }
      },
      { upsert: true }
    )

    const saved = await collection.findOne({ slug })
    if (saved) output.push(toQuestion(saved))
    if (existing) updated += 1
    else created += 1
  }

  return { created, updated, questions: output }
}
