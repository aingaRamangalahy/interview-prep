<script setup lang="ts">
import type { Rating } from '~/types'
import { formatDifficulty, formatSubcategory } from '~/utils/categories'

definePageMeta({
  layout: 'focus'
})

const router = useRouter()
const { state } = useReviewState()
const { pending } = useQuestions()
const {
  activeSession,
  currentQuestion,
  isSessionComplete,
  sessionProgress,
  startSession,
  rateCurrentQuestion,
  completeSession,
  clearSession
} = usePracticeSession()

const showHint = ref(false)
const showAnswer = ref(false)
const sessionSummary = useState<ReturnType<typeof completeSession>>('session-summary', () => null)

onMounted(() => {
  sessionSummary.value = null

  if (!activeSession.value) {
    const count = startSession(state.value.settings.defaultPracticeMode)
    if (count === 0) {
      router.replace('/practice')
    }
  }
})

watch(currentQuestion, () => {
  showHint.value = false
  showAnswer.value = false
})

watch(isSessionComplete, (done) => {
  if (done && activeSession.value === null && !sessionSummary.value) {
    // handled after rating completes session
  }
})

function revealAnswer() {
  showAnswer.value = true
}

function handleRate(rating: Rating) {
  if (!showAnswer.value) return
  rateCurrentQuestion(rating)

  if (isSessionComplete.value) {
    sessionSummary.value = completeSession()
    router.push('/practice/complete')
  } else {
    showHint.value = false
    showAnswer.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return

  if (event.code === 'Space' && !showAnswer.value) {
    event.preventDefault()
    revealAnswer()
    return
  }

  if (!showAnswer.value) return

  const ratingMap: Record<string, Rating> = {
    '1': 'again',
    '2': 'hard',
    '3': 'good',
    '4': 'easy'
  }

  if (ratingMap[event.key]) {
    event.preventDefault()
    handleRate(ratingMap[event.key]!)
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

function exitSession() {
  clearSession()
  router.push('/')
}
</script>

<template>
  <div
    v-if="pending"
    class="flex flex-1 items-center justify-center"
  >
    <UIcon
      name="i-lucide-loader-circle"
      class="size-8 animate-spin text-muted"
    />
  </div>

  <div
    v-else-if="!currentQuestion"
    class="flex flex-1 flex-col items-center justify-center gap-4 text-center"
  >
    <p class="text-muted">
      No questions available for this session.
    </p>
    <UButton to="/practice">
      Choose a mode
    </UButton>
  </div>

  <div
    v-else
    class="flex flex-1 flex-col gap-8"
  >
    <div class="flex items-center justify-between text-sm text-muted">
      <span>Question {{ sessionProgress.current }} / {{ sessionProgress.total }}</span>
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        @click="exitSession"
      >
        Exit
      </UButton>
    </div>

    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          color="neutral"
          variant="subtle"
        >
          {{ formatSubcategory(currentQuestion.subcategory) }}
        </UBadge>
        <UBadge
          color="neutral"
          variant="outline"
        >
          {{ formatDifficulty(currentQuestion.difficulty) }}
        </UBadge>
      </div>

      <h1 class="text-2xl font-semibold leading-snug text-highlighted">
        {{ currentQuestion.title }}
      </h1>
    </div>

    <USeparator />

    <div class="space-y-4">
      <UButton
        v-if="!showHint && currentQuestion.hint"
        color="neutral"
        variant="soft"
        @click="showHint = true"
      >
        Show Hint
      </UButton>

      <UCard
        v-if="showHint && currentQuestion.hint"
        class="border-dashed"
      >
        <p class="text-sm text-muted">
          {{ currentQuestion.hint }}
        </p>
      </UCard>

      <UButton
        v-if="!showAnswer"
        size="lg"
        @click="revealAnswer"
      >
        Reveal Answer
        <UKbd class="ml-2 hidden sm:inline-flex">
          Space
        </UKbd>
      </UButton>

      <UCard
        v-if="showAnswer"
        class="prose prose-invert max-w-none"
      >
        <ContentRenderer
          v-if="currentQuestion.body"
          :value="currentQuestion"
        />
        <p
          v-else
          class="text-muted"
        >
          No answer content yet.
        </p>
      </UCard>
    </div>

    <div
      v-if="showAnswer"
      class="mt-auto space-y-3"
    >
      <p class="text-sm text-muted">
        How well did you know this?
      </p>
      <RatingButtons @rate="handleRate" />
    </div>
  </div>
</template>
