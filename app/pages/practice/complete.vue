<script setup lang="ts">
definePageMeta({
  layout: 'focus'
})

const sessionSummary = useState<{
  questionsCount: number
  averageConfidence: number
  durationMinutes: number
} | null>('session-summary', () => null)

const { state } = useReviewState()

onMounted(() => {
  if (!sessionSummary.value) {
    navigateTo('/')
  }
})
</script>

<template>
  <div
    v-if="sessionSummary"
    class="flex flex-1 flex-col items-center justify-center gap-8 py-12 text-center"
  >
    <div class="space-y-2">
      <p class="text-4xl">
        🎉
      </p>
      <h1 class="text-2xl font-semibold text-highlighted">
        Session Complete
      </h1>
    </div>

    <UCard class="w-full max-w-md text-left">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <p class="text-sm text-muted">
            Questions
          </p>
          <p class="text-xl font-semibold">
            {{ sessionSummary.questionsCount }}
          </p>
        </div>
        <div>
          <p class="text-sm text-muted">
            Average Confidence
          </p>
          <p class="text-xl font-semibold">
            {{ sessionSummary.averageConfidence }}%
          </p>
        </div>
        <div>
          <p class="text-sm text-muted">
            Time
          </p>
          <p class="text-xl font-semibold">
            {{ sessionSummary.durationMinutes }} min
          </p>
        </div>
        <div>
          <p class="text-sm text-muted">
            Streak
          </p>
          <p class="text-xl font-semibold">
            🔥 {{ state.currentStreak }} days
          </p>
        </div>
      </div>
    </UCard>

    <p class="text-muted">
      Keep your streak alive — come back tomorrow.
    </p>

    <div class="flex flex-wrap justify-center gap-3">
      <UButton
        to="/"
        size="lg"
      >
        Dashboard
      </UButton>
      <UButton
        to="/practice"
        color="neutral"
        variant="soft"
        size="lg"
      >
        Practice Again
      </UButton>
    </div>
  </div>
</template>
