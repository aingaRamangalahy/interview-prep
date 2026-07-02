import type { Category, Difficulty, Question, Subcategory } from '~/types'
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
