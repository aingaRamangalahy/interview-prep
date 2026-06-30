<script setup lang="ts">
const {
  pending,
  totalAnswered,
  masteredCount,
  averageConfidence,
  answeredThisWeek,
  answeredThisMonth,
  reviewBacklog,
  weakTopics,
  topicStats
} = useStatistics()

const { state } = useReviewState()
</script>

<template>
  <div class="space-y-8">
    <section class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
        Statistics
      </h1>
      <p class="text-muted">
        Track your progress over time.
      </p>
    </section>

    <div
      v-if="pending"
      class="grid gap-4 sm:grid-cols-2"
    >
      <USkeleton
        v-for="i in 6"
        :key="i"
        class="h-24 w-full"
      />
    </div>

    <div
      v-else
      class="grid gap-4 sm:grid-cols-2"
    >
      <UCard>
        <p class="text-sm text-muted">
          Total Answered
        </p>
        <p class="text-2xl font-semibold">
          {{ totalAnswered }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">
          Current Streak
        </p>
        <p class="text-2xl font-semibold">
          🔥 {{ state.currentStreak }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">
          Longest Streak
        </p>
        <p class="text-2xl font-semibold">
          {{ state.longestStreak }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">
          Mastered
        </p>
        <p class="text-2xl font-semibold">
          {{ masteredCount }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">
          Average Confidence
        </p>
        <p class="text-2xl font-semibold">
          {{ averageConfidence }}%
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">
          Review Backlog
        </p>
        <p class="text-2xl font-semibold">
          {{ reviewBacklog }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">
          This Week
        </p>
        <p class="text-2xl font-semibold">
          {{ answeredThisWeek }}
        </p>
      </UCard>
      <UCard>
        <p class="text-sm text-muted">
          This Month
        </p>
        <p class="text-2xl font-semibold">
          {{ answeredThisMonth }}
        </p>
      </UCard>
    </div>

    <section
      v-if="weakTopics.length"
      class="space-y-3"
    >
      <h2 class="text-sm font-medium text-muted uppercase tracking-wide">
        Weakest Topics
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
        Topic Confidence
      </h2>
      <div class="space-y-4">
        <TopicProgressBar
          v-for="topic in topicStats.filter(t => t.confidence > 0)"
          :key="topic.subcategory"
          :label="`${topic.label} (${topic.confidence}%)`"
          :progress="topic.confidence"
        />
      </div>
    </section>
  </div>
</template>
