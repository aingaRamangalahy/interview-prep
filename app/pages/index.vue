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
  <div class="space-y-8">
    <section class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
        {{ greeting }} 👋
      </h1>
      <p
        v-if="state.currentStreak > 0"
        class="text-muted"
      >
        🔥 {{ state.currentStreak }} day streak
      </p>
      <p
        v-else
        class="text-muted"
      >
        Start your streak today.
      </p>
    </section>

    <UCard>
      <div class="space-y-4">
        <div>
          <p class="text-sm text-muted">
            Today's Focus
          </p>
          <p class="text-xl font-semibold text-highlighted">
            {{ Math.min(dueCount || sessionSize, sessionSize) }} Questions
          </p>
          <p class="text-sm text-muted">
            Estimated time ~{{ estimatedMinutes }} min
          </p>
        </div>

        <UButton
          size="lg"
          block
          :loading="pending"
          @click="startTodaySession"
        >
          Start
        </UButton>
      </div>
    </UCard>

    <section
      v-if="weakTopics.length"
      class="space-y-3"
    >
      <h2 class="text-sm font-medium text-muted uppercase tracking-wide">
        Weak Topics
      </h2>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="topic in weakTopics"
          :key="topic"
          color="warning"
          variant="subtle"
        >
          {{ topic }}
        </UBadge>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-sm font-medium text-muted uppercase tracking-wide">
        Progress
      </h2>
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
      </div>
    </section>
  </div>
</template>
