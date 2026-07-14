<script setup lang="ts">
import { SUBCATEGORY_ICONS } from '~/utils/categories'

const {
  pending,
  totalAnswered,
  masteredCount,
  averageConfidence,
  answeredThisWeek,
  answeredThisMonth,
  reviewBacklog,
  topicStats
} = useStatistics()

const { state } = useReviewState()

const stats = computed(() => [
  { label: 'Total Answered', value: totalAnswered.value, icon: 'i-lucide-check-check' },
  { label: 'Current Streak', value: state.value.currentStreak, icon: 'i-lucide-flame' },
  { label: 'Longest Streak', value: state.value.longestStreak, icon: 'i-lucide-trophy' },
  { label: 'Mastered', value: masteredCount.value, icon: 'i-lucide-graduation-cap' },
  { label: 'Avg. Confidence', value: `${averageConfidence.value}%`, icon: 'i-lucide-gauge' },
  { label: 'Review Backlog', value: reviewBacklog.value, icon: 'i-lucide-inbox', warn: reviewBacklog.value > 0 },
  { label: 'This Week', value: answeredThisWeek.value, icon: 'i-lucide-calendar-days' },
  { label: 'This Month', value: answeredThisMonth.value, icon: 'i-lucide-calendar-range' }
])

const ratedTopics = computed(() => topicStats.value.filter(t => t.confidence > 0))

const weakestTopics = computed(() =>
  [...ratedTopics.value]
    .sort((a, b) => a.confidence - b.confidence || b.againCount - a.againCount)
    .slice(0, 3)
)

const topicsByConfidence = computed(() =>
  [...ratedTopics.value].sort((a, b) => a.confidence - b.confidence)
)
</script>

<template>
  <div class="space-y-8">
    <section class="space-y-2 rounded-2xl border border-default/80 bg-elevated/35 p-5 sm:p-6">
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        Statistics
      </h1>
      <p class="text-sm text-muted sm:text-base">
        Track your progress over time.
      </p>
    </section>

    <div
      v-if="pending"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <USkeleton
        v-for="i in 8"
        :key="i"
        class="h-20 w-full"
      />
    </div>

    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <UCard
        v-for="stat in stats"
        :key="stat.label"
      >
        <div class="flex items-center gap-1.5 text-muted">
          <UIcon
            :name="stat.icon"
            class="size-4 shrink-0"
          />
          <p class="text-sm">
            {{ stat.label }}
          </p>
        </div>
        <p
          class="mt-2 text-2xl font-semibold"
          :class="stat.warn ? 'text-warning' : 'text-highlighted'"
        >
          {{ stat.value }}
        </p>
      </UCard>
    </div>

    <section
      v-if="weakestTopics.length"
      class="space-y-3"
    >
      <h2 class="text-sm font-medium uppercase tracking-wide text-muted">
        Weakest Topics
      </h2>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="topic in weakestTopics"
          :key="topic.subcategory"
          color="warning"
          variant="subtle"
          class="rounded-full"
          :icon="SUBCATEGORY_ICONS[topic.subcategory]"
        >
          {{ topic.label }} · {{ topic.confidence }}%
        </UBadge>
      </div>
    </section>

    <section class="space-y-4">
      <h2 class="text-sm font-medium uppercase tracking-wide text-muted">
        Topic Confidence
      </h2>
      <UCard>
        <div class="space-y-4">
          <TopicProgressBar
            v-for="topic in topicsByConfidence"
            :key="topic.subcategory"
            :label="topic.label"
            :icon="SUBCATEGORY_ICONS[topic.subcategory]"
            :progress="topic.confidence"
          />
          <p
            v-if="topicsByConfidence.length === 0"
            class="text-sm text-muted"
          >
            Complete more sessions to build confidence insights.
          </p>
        </div>
      </UCard>
    </section>
  </div>
</template>
