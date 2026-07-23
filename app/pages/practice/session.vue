<script setup lang="ts">
import type { Rating } from '~/types'
import { DIFFICULTY_COLORS, formatDifficulty, formatSubcategory, SUBCATEGORY_ICONS } from '~/utils/categories'

definePageMeta({
  layout: 'focus'
})

useSiteSeo({
  title: 'Practice Session',
  description: 'Active interview practice session.',
  noindex: true
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

function revealHint() {
  if (currentQuestion.value?.hint) showHint.value = true
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

function exitSession() {
  clearSession()
  router.push('/')
}

defineShortcuts({
  ' ': () => {
    if (!showAnswer.value) revealAnswer()
  },
  'h': revealHint,
  'escape': exitSession,
  '1': () => handleRate('again'),
  '2': () => handleRate('hard'),
  '3': () => handleRate('good'),
  '4': () => handleRate('easy')
})
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
    class="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-default p-10 text-center"
  >
    <UIcon
      name="i-lucide-notebook-pen"
      class="size-8 text-muted"
    />
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
    <div class="space-y-3">
      <div class="flex items-center justify-between text-sm text-muted">
        <span>Question {{ sessionProgress.current }} / {{ sessionProgress.total }}</span>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          @click="exitSession"
        >
          Exit
          <UKbd class="ml-1 hidden sm:inline-flex">
            Esc
          </UKbd>
        </UButton>
      </div>
      <UProgress
        :model-value="Math.round((sessionProgress.current / sessionProgress.total) * 100)"
        size="xs"
      />
    </div>

    <div class="space-y-3 rounded-2xl border border-default/80 bg-elevated/35 p-5 sm:p-6">
      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          color="neutral"
          variant="subtle"
          :icon="SUBCATEGORY_ICONS[currentQuestion.subcategory]"
        >
          {{ formatSubcategory(currentQuestion.subcategory) }}
        </UBadge>
        <UBadge
          :color="DIFFICULTY_COLORS[currentQuestion.difficulty]"
          variant="subtle"
        >
          {{ formatDifficulty(currentQuestion.difficulty) }}
        </UBadge>
      </div>

      <h1 class="text-2xl font-semibold leading-snug text-highlighted">
        {{ currentQuestion.title }}
      </h1>
    </div>

    <div class=" flex flex-col gap-4">
      <UCollapsible
        v-if="currentQuestion.hint"
        v-model:open="showHint"
      >
        <UButton
          color="neutral"
          variant="soft"
          :trailing-icon="showHint ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        >
          Show Hint
          <UKbd class="ml-2 hidden sm:inline-flex">
            H
          </UKbd>
        </UButton>

        <template #content>
          <UAlert
            class="mt-3"
            color="warning"
            variant="subtle"
            icon="i-lucide-lightbulb"
            :description="currentQuestion.hint"
          />
        </template>
      </UCollapsible>

      <UCollapsible v-model:open="showAnswer">
        <UButton
          size="lg"
          icon="i-lucide-eye"
          :trailing-icon="showAnswer ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
        >
          Reveal Answer
          <UKbd class="ml-2 hidden sm:inline-flex">
            Space
          </UKbd>
        </UButton>

        <template #content>
          <UCard class="prose dark:prose-invert mt-3 max-w-none">
            <MarkdownContent
              v-if="currentQuestion.answer"
              :content="currentQuestion.answer"
            />
            <p
              v-else
              class="text-muted"
            >
              No answer content yet.
            </p>
          </UCard>
        </template>
      </UCollapsible>
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
