import type { ExtensionProgress, Question, Rating, ReviewState } from './types'

const INTERVAL_DAYS: Record<Rating, number> = {
  again: 1,
  hard: 3,
  good: 7,
  easy: 21
}

export const RATING_LABELS: Record<Rating, { label: string, description: string, emoji: string }> = {
  easy: { label: 'Easy', description: 'I knew it immediately.', emoji: '🟢' },
  good: { label: 'Good', description: 'I remembered after thinking.', emoji: '🟡' },
  hard: { label: 'Hard', description: 'I struggled.', emoji: '🟠' },
  again: { label: 'Again', description: 'I didn\'t know.', emoji: '🔴' }
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

export function createDefaultProgress(): ExtensionProgress {
  return {
    reviews: {},
    lastSessionDate: null,
    currentStreak: 0,
    longestStreak: 0,
    completedSessions: 0
  }
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
  const nextStreak = lastSessionDate === yesterday ? currentStreak + 1 : 1

  return {
    lastSessionDate: sessionDate,
    currentStreak: nextStreak,
    longestStreak: Math.max(longestStreak, nextStreak)
  }
}

export function selectSessionQuestions(
  questions: Question[],
  reviews: Record<string, ReviewState>,
  sessionSize: number
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
  if (pool.length < sessionSize) {
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
