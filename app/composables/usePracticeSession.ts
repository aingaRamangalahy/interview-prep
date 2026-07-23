import type { ActiveSession, PracticeModePreset, Question, Rating } from '~/types'
import {
  applyRating,
  averageConfidence,
  filterQuestionsByMode,
  selectSessionQuestions
} from '~/utils/srs'

export function usePracticeSession() {
  const { questions } = useQuestions()
  const { state, ensureReview, recordSession } = useReviewState()

  const activeSession = useState<ActiveSession | null>('active-session', () => null)

  function startSession(mode: PracticeModePreset, includeExtra = false) {
    const filtered = filterQuestionsByMode(
      questions.value ?? [],
      mode,
      state.value.settings,
      state.value.mutedQuestionIds
    )

    const selected = selectSessionQuestions(
      filtered,
      state.value.reviews,
      state.value.settings.sessionSize,
      includeExtra
    )

    activeSession.value = {
      questionIds: selected.map(q => q.id),
      currentIndex: 0,
      startedAt: Date.now(),
      mode,
      ratings: []
    }

    return selected.length
  }

  const sessionQuestions = computed(() => {
    if (!activeSession.value) return [] as Question[]
    return activeSession.value.questionIds
      .map(id => questions.value?.find(q => q.id === id))
      .filter(Boolean) as Question[]
  })

  const currentQuestion = computed(() => {
    if (!activeSession.value) return null
    const id = activeSession.value.questionIds[activeSession.value.currentIndex]
    return questions.value?.find(q => q.id === id) ?? null
  })

  const isSessionComplete = computed(() => {
    if (!activeSession.value) return false
    return activeSession.value.currentIndex >= activeSession.value.questionIds.length
  })

  const sessionProgress = computed(() => {
    if (!activeSession.value || activeSession.value.questionIds.length === 0) {
      return { current: 0, total: 0 }
    }
    return {
      current: Math.min(activeSession.value.currentIndex + 1, activeSession.value.questionIds.length),
      total: activeSession.value.questionIds.length
    }
  })

  function rateCurrentQuestion(rating: Rating) {
    if (!activeSession.value || !currentQuestion.value) return

    const review = ensureReview(currentQuestion.value.id)
    state.value.reviews[currentQuestion.value.id] = applyRating(review, rating)
    activeSession.value.ratings.push(rating)
    activeSession.value.currentIndex += 1
  }

  function completeSession() {
    if (!activeSession.value) return null

    const durationMinutes = Math.max(
      1,
      Math.round((Date.now() - activeSession.value.startedAt) / 60000)
    )
    const ratings = [...activeSession.value.ratings]
    const summary = {
      questionsCount: ratings.length,
      averageConfidence: averageConfidence(ratings),
      durationMinutes,
      ratings
    }

    recordSession({
      date: new Date().toISOString().slice(0, 10),
      questionsCount: summary.questionsCount,
      averageConfidence: summary.averageConfidence,
      durationMinutes: summary.durationMinutes
    })

    activeSession.value = null
    return summary
  }

  function clearSession() {
    activeSession.value = null
  }

  function dueCountForMode(mode: PracticeModePreset) {
    const filtered = filterQuestionsByMode(
      questions.value ?? [],
      mode,
      state.value.settings,
      state.value.mutedQuestionIds
    )
    return selectSessionQuestions(
      filtered,
      state.value.reviews,
      state.value.settings.sessionSize,
      false
    ).length
  }

  function availableCountForMode(mode: PracticeModePreset) {
    return filterQuestionsByMode(
      questions.value ?? [],
      mode,
      state.value.settings,
      state.value.mutedQuestionIds
    ).length
  }

  return {
    activeSession,
    sessionQuestions,
    currentQuestion,
    isSessionComplete,
    sessionProgress,
    startSession,
    rateCurrentQuestion,
    completeSession,
    clearSession,
    dueCountForMode,
    availableCountForMode
  }
}
