import type { AppSettings, PracticeModePreset, Question, Rating, ReviewState } from '~/types'
import { getSubcategoriesForMode } from '~/utils/categories'

const INTERVAL_DAYS: Record<Rating, number> = {
  again: 1,
  hard: 3,
  good: 7,
  easy: 21
}

export const RATING_CONFIDENCE: Record<Rating, number> = {
  easy: 100,
  good: 78,
  hard: 50,
  again: 25
}

export type RatingColor = 'success' | 'info' | 'warning' | 'error'

export const RATING_LABELS: Record<Rating, { label: string, description: string, icon: string, color: RatingColor }> = {
  easy: { label: 'Easy', description: 'I knew it immediately.', icon: 'i-lucide-smile-plus', color: 'success' },
  good: { label: 'Good', description: 'I remembered after thinking.', icon: 'i-lucide-meh', color: 'info' },
  hard: { label: 'Hard', description: 'I struggled.', icon: 'i-lucide-annoyed', color: 'warning' },
  again: { label: 'Again', description: 'I didn\'t know.', icon: 'i-lucide-frown', color: 'error' }
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(dateISO: string, days: number): string {
  const date = new Date(`${dateISO}T12:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export function scheduleNextReview(rating: Rating, fromDate = todayISO()): string {
  return addDays(fromDate, INTERVAL_DAYS[rating])
}

export function createReviewState(questionId: string): ReviewState {
  return {
    questionId,
    lastRating: null,
    nextReviewDate: null,
    reviewCount: 0,
    lastReviewedAt: null,
    mastered: false
  }
}

export function applyRating(state: ReviewState, rating: Rating): ReviewState {
  const now = todayISO()
  const reviewCount = state.reviewCount + 1
  const mastered = rating === 'easy' && reviewCount >= 3

  return {
    ...state,
    lastRating: rating,
    nextReviewDate: scheduleNextReview(rating, now),
    reviewCount,
    lastReviewedAt: now,
    mastered
  }
}

export function isDue(review: ReviewState | undefined, date = todayISO()): boolean {
  if (!review || review.reviewCount === 0) return true
  if (!review.nextReviewDate) return true
  return review.nextReviewDate <= date
}

export function isNew(review: ReviewState | undefined): boolean {
  return !review || review.reviewCount === 0
}

export function isMastered(review: ReviewState | undefined): boolean {
  return !!review?.mastered
}

export function filterQuestionsByMode(
  questions: Question[],
  mode: PracticeModePreset,
  settings: AppSettings,
  mutedQuestionIds: string[] = []
): Question[] {
  const subcategories = getSubcategoriesForMode(mode, settings.customSubcategories)
  const muted = new Set(mutedQuestionIds)

  return questions.filter((q) => {
    if (q.status === 'archived') return false
    if (muted.has(q.id)) return false
    if (subcategories && !subcategories.includes(q.subcategory)) return false
    return true
  })
}

export function selectSessionQuestions(
  questions: Question[],
  reviews: Record<string, ReviewState>,
  sessionSize: number,
  includeExtra = false
): Question[] {
  const due: Question[] = []
  const fresh: Question[] = []
  const later: Question[] = []

  for (const question of questions) {
    const review = reviews[question.id]
    if (isNew(review)) {
      fresh.push(question)
    } else if (isDue(review)) {
      due.push(question)
    } else {
      later.push(question)
    }
  }

  const pool = [...due, ...fresh]
  if (includeExtra && pool.length < sessionSize) {
    pool.push(...later.slice(0, sessionSize - pool.length))
  }

  return shuffle(pool).slice(0, sessionSize)
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

export function estimateSessionMinutes(count: number): number {
  return Math.max(5, Math.round(count * 2.2))
}

export function averageConfidence(ratings: Rating[]): number {
  if (ratings.length === 0) return 0
  const total = ratings.reduce((sum, rating) => sum + RATING_CONFIDENCE[rating], 0)
  return Math.round(total / ratings.length)
}

export function updateStreak(
  lastSessionDate: string | null,
  currentStreak: number,
  longestStreak: number,
  sessionDate = todayISO()
): { lastSessionDate: string, currentStreak: number, longestStreak: number } {
  if (lastSessionDate === sessionDate) {
    return { lastSessionDate, currentStreak, longestStreak }
  }

  const yesterday = addDays(sessionDate, -1)
  let nextStreak = 1

  if (lastSessionDate === yesterday) {
    nextStreak = currentStreak + 1
  } else if (lastSessionDate === sessionDate) {
    nextStreak = currentStreak
  }

  return {
    lastSessionDate: sessionDate,
    currentStreak: nextStreak,
    longestStreak: Math.max(longestStreak, nextStreak)
  }
}
