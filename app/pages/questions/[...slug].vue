<script setup lang="ts">
import { formatDifficulty, formatSubcategory } from '~/utils/categories'

const route = useRoute()
const { questions, pending } = useQuestions()
const { getQuestionStatus } = useStatistics()

const questionId = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param.join('/') : String(param)
})

const question = computed(() =>
  questions.value?.find(q => q.id === questionId.value)
)
</script>

<template>
  <div
    v-if="pending"
    class="space-y-4"
  >
    <USkeleton class="h-8 w-2/3" />
    <USkeleton class="h-32 w-full" />
  </div>

  <div
    v-else-if="!question"
    class="space-y-4 text-center"
  >
    <p class="text-muted">
      Question not found.
    </p>
    <UButton to="/questions">
      Back to library
    </UButton>
  </div>

  <div
    v-else
    class="space-y-6"
  >
    <UButton
      to="/questions"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back
    </UButton>

    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <UBadge
          color="neutral"
          variant="subtle"
        >
          {{ formatSubcategory(question.subcategory) }}
        </UBadge>
        <UBadge
          color="neutral"
          variant="outline"
        >
          {{ formatDifficulty(question.difficulty) }}
        </UBadge>
        <QuestionStatusBadge :status="getQuestionStatus(question.id)" />
      </div>

      <h1 class="text-2xl font-semibold text-highlighted">
        {{ question.title }}
      </h1>
    </div>

    <UCard
      v-if="question.hint"
      class="border-dashed"
    >
      <p class="text-sm font-medium text-muted">
        Hint
      </p>
      <p class="mt-1">
        {{ question.hint }}
      </p>
    </UCard>

    <UCard>
      <p class="mb-3 text-sm font-medium text-muted">
        Ideal Answer
      </p>
      <div class="prose prose-invert max-w-none">
        <ContentRenderer
          v-if="question.body"
          :value="question"
        />
      </div>
    </UCard>
  </div>
</template>
