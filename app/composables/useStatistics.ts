import type { Question, QuestionStatus, Subcategory } from '~/types'
import { formatSubcategory } from '~/utils/categories'
import {
  isDue,
  isMastered,
  isNew,
  RATING_CONFIDENCE,
  todayISO
} from '~/utils/srs'

export function useStatistics() {
  const { questions, pending } = useQuestions()
  const { state } = useReviewState()

  const activeQuestions = computed(() => {
    const muted = new Set(state.value.mutedQuestionIds)
    return (questions.value ?? []).filter(q => q.status !== 'archived' && !muted.has(q.id))
  })

  function getQuestionStatus(questionId: string): QuestionStatus {
    const review = state.value.reviews[questionId]
    if (isNew(review)) return 'new'
    if (isMastered(review)) return 'mastered'
    if (isDue(review)) return 'due'
    return 'scheduled'
  }

  const totalAnswered = computed(() =>
    Object.values(state.value.reviews).reduce((sum, review) => sum + review.reviewCount, 0)
  )

  const masteredCount = computed(() =>
    Object.values(state.value.reviews).filter(review => review.mastered).length
  )

  const averageConfidence = computed(() => {
    const ratings = Object.values(state.value.reviews)
      .map(r => r.lastRating)
      .filter(Boolean)

    if (ratings.length === 0) return 0

    const total = ratings.reduce(
      (sum, rating) => sum + RATING_CONFIDENCE[rating!],
      0
    )
    return Math.round(total / ratings.length)
  })

  const answeredThisWeek = computed(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const cutoff = weekAgo.toISOString().slice(0, 10)

    return state.value.sessions
      .filter(session => session.date >= cutoff)
      .reduce((sum, session) => sum + session.questionsCount, 0)
  })

  const answeredThisMonth = computed(() => {
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    const cutoff = monthAgo.toISOString().slice(0, 10)

    return state.value.sessions
      .filter(session => session.date >= cutoff)
      .reduce((sum, session) => sum + session.questionsCount, 0)
  })

  const reviewBacklog = computed(() =>
    activeQuestions.value.filter(q => isDue(state.value.reviews[q.id])).length
  )

  const topicStats = computed(() => {
    const map = new Map<Subcategory, { total: number, confidenceSum: number, rated: number, againCount: number }>()

    // Scope progress % and weak-topic detection to active + unmuted questions only.
    // Historical totals (answered/mastered) stay based on all reviews above.
    for (const question of activeQuestions.value) {
      const entry = map.get(question.subcategory) ?? { total: 0, confidenceSum: 0, rated: 0, againCount: 0 }
      entry.total += 1

      const review = state.value.reviews[question.id]
      if (review?.lastRating) {
        entry.rated += 1
        entry.confidenceSum += RATING_CONFIDENCE[review.lastRating]
        if (review.lastRating === 'again') entry.againCount += 1
      }

      map.set(question.subcategory, entry)
    }

    return [...map.entries()].map(([subcategory, stats]) => ({
      subcategory,
      label: formatSubcategory(subcategory),
      total: stats.total,
      rated: stats.rated,
      progress: stats.total === 0 ? 0 : Math.round((stats.rated / stats.total) * 100),
      confidence: stats.rated === 0 ? 0 : Math.round(stats.confidenceSum / stats.rated),
      againCount: stats.againCount
    }))
  })

  const weakTopics = computed(() =>
    [...topicStats.value]
      .filter(topic => topic.rated > 0)
      .sort((a, b) => a.confidence - b.confidence || b.againCount - a.againCount)
      .slice(0, 3)
      .map(topic => topic.label)
  )

  function filterQuestions(
    search: string,
    subcategory: Subcategory | 'all',
    difficulty: string,
    status: QuestionStatus | 'all'
  ): Question[] {
    const query = search.trim().toLowerCase()

    return (questions.value ?? []).filter((question) => {
      if (subcategory !== 'all' && question.subcategory !== subcategory) return false
      if (difficulty !== 'all' && question.difficulty !== difficulty) return false

      const questionStatus = getQuestionStatus(question.id)
      if (status !== 'all' && questionStatus !== status) return false

      if (!query) return true

      return (
        question.title.toLowerCase().includes(query)
        || question.tags.some(tag => tag.toLowerCase().includes(query))
      )
    })
  }

  return {
    pending,
    totalAnswered,
    masteredCount,
    averageConfidence,
    answeredThisWeek,
    answeredThisMonth,
    reviewBacklog,
    topicStats,
    weakTopics,
    getQuestionStatus,
    filterQuestions
  }
}

export function useGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const TIPS_OF_THE_DAY = [
  'Keep sessions short and daily for stronger long-term recall.',
  'Rate honestly — marking "Again" now saves you from forgetting later.',
  'Explaining an answer out loud sticks better than reading it silently.',
  'Consistency beats intensity — five focused minutes daily wins.',
  'Struggling with a topic? Revisit it before moving to the next one.',
  'Spaced repetition works best when you don\'t skip days.',
  'Review your weakest topics first, while your focus is freshest.',
  'One missed day is fine. Two in a row breaks the habit — come back.'
]

export function useTipOfTheDay() {
  const startOfYear = new Date(new Date().getFullYear(), 0, 0).getTime()
  const dayOfYear = Math.floor((Date.now() - startOfYear) / 86400000)
  return TIPS_OF_THE_DAY[dayOfYear % TIPS_OF_THE_DAY.length]
}

export function useTodayISO() {
  return todayISO()
}
