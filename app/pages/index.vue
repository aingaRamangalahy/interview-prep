<script setup lang="ts">
import { estimateSessionMinutes } from '~/utils/srs'

const { state } = useReviewState()
const { pending, weakTopics, topicStats } = useStatistics()
const { dueCountForMode, startSession } = usePracticeSession()

const greeting = useGreeting()
const sessionSize = computed(() => state.value.settings.sessionSize)
const dueCount = computed(() =>
  dueCountForMode(state.value.settings.defaultPracticeMode)
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
</script>

<template>
  <div class="space-y-7">
    <section class="rounded-2xl border border-default/80 bg-elevated/40 p-5 sm:p-6">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-2">
          <h1 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
            {{ greeting }} 👋
          </h1>
          <p
            v-if="state.currentStreak > 0"
            class="text-sm text-muted sm:text-base"
          >
            🔥 {{ state.currentStreak }} day streak. Keep the rhythm going.
          </p>
          <p
            v-else
            class="text-sm text-muted sm:text-base"
          >
            Your streak starts with one focused session.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:min-w-72">
          <UCard>
            <p class="text-xs uppercase tracking-wide text-muted">
              Due Today
            </p>
            <p class="mt-1 text-xl font-semibold text-highlighted">
              {{ Math.min(dueCount || sessionSize, sessionSize) }}
            </p>
          </UCard>
          <UCard>
            <p class="text-xs uppercase tracking-wide text-muted">
              Est. Time
            </p>
            <p class="mt-1 text-xl font-semibold text-highlighted">
              {{ estimatedMinutes }} min
            </p>
          </UCard>
        </div>
      </div>
    </section>

    <UCard class="border-primary/20">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-medium text-highlighted">
            Ready for today's focus block?
          </p>
          <p class="mt-1 text-sm text-muted">
            Start a {{ state.settings.defaultPracticeMode }} session with your due questions.
          </p>
        </div>
        <UButton
          size="lg"
          :loading="pending"
          icon="i-lucide-play"
          @click="startTodaySession"
        >
          Start Session
        </UButton>
      </div>
    </UCard>

    <section
      v-if="weakTopics.length"
      class="space-y-3"
    >
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-sm font-medium text-muted uppercase tracking-wide">
          Focus Topics
        </h2>
        <NuxtLink
          to="/statistics"
          class="text-xs font-medium text-primary hover:underline"
        >
          View stats
        </NuxtLink>
      </div>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="topic in weakTopics"
          :key="topic"
          color="warning"
          variant="subtle"
          class="rounded-full"
        >
          {{ topic }}
        </UBadge>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-sm font-medium text-muted uppercase tracking-wide">
        Progress by Topic
      </h2>
      <UCard>
        <div
          v-if="pending"
          class="space-y-3"
        >
          <USkeleton class="h-8 w-full" />
          <USkeleton class="h-8 w-full" />
          <USkeleton class="h-8 w-full" />
        </div>
        <div
          v-else
          class="space-y-4"
        >
          <TopicProgressBar
            v-for="topic in topicStats.filter(t => t.total > 0).slice(0, 6)"
            :key="topic.subcategory"
            :label="topic.label"
            :progress="topic.progress"
          />
          <p
            v-if="topicStats.filter(t => t.total > 0).length === 0"
            class="text-sm text-muted"
          >
            Progress will appear as you complete more questions.
          </p>
        </div>
      </UCard>
    </section>
  </div>
</template>
