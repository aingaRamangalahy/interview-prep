<script setup lang="ts">
import { estimateSessionMinutes } from '~/utils/srs'

useSiteSeo({
  title: 'Daily Interview Practice',
  description: 'Start a daily interview practice session with spaced repetition. Track due questions, streaks, and weak topics.',
  path: '/',
  og: {
    title: 'Master your next JavaScript interview',
    description: 'Daily spaced-repetition practice for JavaScript, TypeScript, Vue, and behavioral interviews.',
    eyebrow: 'Daily Practice'
  }
})

const { state } = useReviewState()
const { pending, weakTopics } = useStatistics()
const { dueCountForMode, startSession } = usePracticeSession()

const greeting = useGreeting()
const tip = useTipOfTheDay()
const sessionSize = computed(() => state.value.settings.sessionSize)
const dueCount = computed(() =>
  dueCountForMode(state.value.settings.defaultPracticeMode)
)
const displayDueCount = computed(() =>
  Math.min(dueCount.value || sessionSize.value, sessionSize.value)
)
const estimatedMinutes = computed(() => estimateSessionMinutes(dueCount.value || sessionSize.value))

function startTodaySession() {
  const count = startSession(state.value.settings.defaultPracticeMode)
  if (count === 0) {
    navigateTo('/practice')
    return
  }
  navigateTo('/practice/session')
}

defineShortcuts({
  enter: () => startTodaySession()
})
</script>

<template>
  <div class="flex flex-col gap-16">
    <section class="flex min-h-[56vh] flex-col items-center justify-center gap-7 text-center">
      <p class="text-sm text-muted">
        {{ greeting }}
      </p>

      <UButton
        size="xl"
        :loading="pending"
        class="h-16 rounded-2xl px-10 text-base font-medium"
        @click="startTodaySession"
      >
        Start Session
        <UKbd class="ml-2 hidden sm:inline-flex">
          Enter
        </UKbd>
      </UButton>

      <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted">
        <span>{{ displayDueCount }} due</span>
        <span aria-hidden="true">·</span>
        <span>~{{ estimatedMinutes }} min</span>
        <template v-if="state.currentStreak > 0">
          <span aria-hidden="true">·</span>
          <span>🔥 {{ state.currentStreak }} day streak</span>
        </template>
      </div>
    </section>

    <section
      v-if="weakTopics.length"
      class="space-y-3"
    >
      <h2 class="text-xs font-medium uppercase tracking-wide text-dimmed">
        Focus topics
      </h2>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="topic in weakTopics"
          :key="topic"
          color="neutral"
          variant="subtle"
          class="rounded-full"
        >
          {{ topic }}
        </UBadge>
      </div>
    </section>

    <section class="rounded-xl border border-default/80 bg-elevated/40 p-4">
      <p class="text-xs text-muted">
        Tip
      </p>
      <p class="mt-1 text-sm text-highlighted">
        {{ tip }}
      </p>
    </section>
  </div>
</template>
