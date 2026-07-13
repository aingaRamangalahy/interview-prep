import type { Difficulty, Subcategory } from '~/types'
import { createOrUpdateQuestions, type CreateQuestionInput } from '../../utils/questions'

const allowedSubcategories = new Set<Subcategory>([
  'javascript',
  'typescript',
  'vue',
  'angular',
  'node',
  'problem-solving',
  'behavioral',
  'communication',
  'career'
])

const allowedDifficulties = new Set<Difficulty>(['easy', 'medium', 'hard'])

type QuestionPayload = {
  slug?: string
  title?: string
  subcategory?: string
  difficulty?: string
  hint?: string
  answer?: string
  tags?: unknown
  source?: string
  notes?: string
}

function normalizeQuestion(input: QuestionPayload, index: number): CreateQuestionInput {
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const answer = typeof input.answer === 'string' ? input.answer.trim() : ''
  const subcategory = typeof input.subcategory === 'string' ? input.subcategory.trim() : ''
  const difficulty = typeof input.difficulty === 'string' ? input.difficulty.trim() : ''

  if (!title) throw createError({ statusCode: 400, statusMessage: `Question #${index + 1}: title is required` })
  if (!answer) throw createError({ statusCode: 400, statusMessage: `Question #${index + 1}: answer is required` })
  if (!allowedSubcategories.has(subcategory as Subcategory)) {
    throw createError({ statusCode: 400, statusMessage: `Question #${index + 1}: invalid subcategory` })
  }
  if (!allowedDifficulties.has(difficulty as Difficulty)) {
    throw createError({ statusCode: 400, statusMessage: `Question #${index + 1}: invalid difficulty` })
  }

  const tags = Array.isArray(input.tags)
    ? input.tags
        .map(tag => String(tag).trim())
        .filter(Boolean)
    : []

  const normalized: CreateQuestionInput = {
    title,
    subcategory: subcategory as Subcategory,
    difficulty: difficulty as Difficulty,
    answer,
    tags
  }

  if (typeof input.slug === 'string' && input.slug.trim()) normalized.slug = input.slug.trim()
  if (typeof input.hint === 'string' && input.hint.trim()) normalized.hint = input.hint.trim()
  if (typeof input.source === 'string' && input.source.trim()) normalized.source = input.source.trim()
  if (typeof input.notes === 'string' && input.notes.trim()) normalized.notes = input.notes.trim()

  return normalized
}

export default defineEventHandler(async (event) => {
  const body = await readBody<QuestionPayload | { questions?: QuestionPayload[] } | QuestionPayload[]>(event)

  let payload: QuestionPayload[] = []
  if (Array.isArray(body)) {
    payload = body
  } else if (body && typeof body === 'object' && Array.isArray((body as { questions?: QuestionPayload[] }).questions)) {
    payload = (body as { questions: QuestionPayload[] }).questions
  } else if (body && typeof body === 'object') {
    payload = [body as QuestionPayload]
  }

  if (payload.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Request must include one or more questions' })
  }

  const normalized = payload.map((item, index) => normalizeQuestion(item, index))
  return createOrUpdateQuestions(normalized)
})
