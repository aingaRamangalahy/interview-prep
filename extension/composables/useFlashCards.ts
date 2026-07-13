import {
  javascriptQuestions,
  selectSessionQuestions,
  type Question,
  type Rating,
  type ExtensionProgress
} from '@interview-prep/shared'
import { computed, ref } from 'vue'
import { useProgress } from './useProgress'

const SESSION_SIZE = 5

export function useFlashCards() {
  const { load, rateQuestion, completeSession } = useProgress()

  const progress = ref<ExtensionProgress | null>(null)
  const deck = ref<Question[]>([])
  const currentIndex = ref(0)
  const showAnswer = ref(false)
  const showHint = ref(false)
  const sessionComplete = ref(false)
  const ratings = ref<Rating[]>([])
  const ready = ref(false)

  const currentQuestion = computed(() => deck.value[currentIndex.value] ?? null)
  const sessionProgress = computed(() => ({
    current: Math.min(currentIndex.value + 1, deck.value.length),
    total: deck.value.length
  }))

  async function startSession() {
    try {
      progress.value = await load()
      deck.value = selectSessionQuestions(
        javascriptQuestions,
        progress.value.reviews,
        SESSION_SIZE
      )
      currentIndex.value = 0
      showAnswer.value = false
      showHint.value = false
      sessionComplete.value = false
      ratings.value = []
    } catch (error) {
      console.error('[flashtab] failed to start session', error)
      deck.value = javascriptQuestions.slice(0, SESSION_SIZE)
      progress.value = progress.value ?? {
        reviews: {},
        lastSessionDate: null,
        currentStreak: 0,
        longestStreak: 0,
        completedSessions: 0
      }
    } finally {
      ready.value = true
    }
  }

  function revealAnswer() {
    showAnswer.value = true
  }

  async function rate(rating: Rating) {
    const question = currentQuestion.value
    if (!question || !showAnswer.value) return

    progress.value = await rateQuestion(question.id, rating)
    ratings.value.push(rating)

    if (currentIndex.value >= deck.value.length - 1) {
      progress.value = await completeSession()
      sessionComplete.value = true
      return
    }

    currentIndex.value += 1
    showAnswer.value = false
    showHint.value = false
  }

  async function restart() {
    await startSession()
  }

  return {
    ready,
    progress,
    deck,
    currentQuestion,
    currentIndex,
    showAnswer,
    showHint,
    sessionComplete,
    sessionProgress,
    ratings,
    startSession,
    revealAnswer,
    rate,
    restart
  }
}
