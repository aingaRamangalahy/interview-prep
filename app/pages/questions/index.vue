<script setup lang="ts">
import type { QuestionStatus, Subcategory } from '~/types'
import { ALL_SUBCATEGORIES, formatDifficulty, formatSubcategory } from '~/utils/categories'

const search = ref('')
const subcategory = ref<Subcategory | 'all'>('all')
const difficulty = ref<'all' | 'easy' | 'medium' | 'hard'>('all')
const status = ref<QuestionStatus | 'all'>('all')

const { pending } = useQuestions()
const { filterQuestions, getQuestionStatus } = useStatistics()

const filteredQuestions = computed(() =>
  filterQuestions(search.value, subcategory.value, difficulty.value, status.value)
)
</script>

<template>
  <div class="space-y-6">
    <section class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
        Questions
      </h1>
      <p class="text-muted">
        Browse your question library. Edit questions by updating Markdown files in the repo.
      </p>
    </section>

    <div class="grid gap-3 sm:grid-cols-2">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Search questions..."
      />
      <USelect
        v-model="subcategory"
        :items="[
          { label: 'All topics', value: 'all' },
          ...ALL_SUBCATEGORIES.map(s => ({ label: formatSubcategory(s), value: s }))
        ]"
      />
      <USelect
        v-model="difficulty"
        :items="[
          { label: 'All difficulties', value: 'all' },
          { label: 'Easy', value: 'easy' },
          { label: 'Medium', value: 'medium' },
          { label: 'Hard', value: 'hard' }
        ]"
      />
      <USelect
        v-model="status"
        :items="[
          { label: 'All statuses', value: 'all' },
          { label: 'New', value: 'new' },
          { label: 'Due today', value: 'due' },
          { label: 'Mastered', value: 'mastered' },
          { label: 'Scheduled', value: 'scheduled' }
        ]"
      />
    </div>

    <div
      v-if="pending"
      class="space-y-3"
    >
      <USkeleton
        v-for="i in 5"
        :key="i"
        class="h-16 w-full"
      />
    </div>

    <div
      v-else-if="filteredQuestions.length === 0"
      class="rounded-xl border border-dashed border-default p-8 text-center text-muted"
    >
      No questions match your filters.
    </div>

    <div
      v-else
      class="space-y-2"
    >
      <NuxtLink
        v-for="question in filteredQuestions"
        :key="question.id"
        :to="`/questions/${question.id}`"
        class="flex items-center justify-between gap-4 rounded-xl border border-default bg-elevated/30 p-4 transition-colors hover:border-primary/30"
      >
        <div class="min-w-0 space-y-1">
          <p class="truncate font-medium text-highlighted">
            {{ question.title }}
          </p>
          <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{{ formatSubcategory(question.subcategory) }}</span>
            <span>·</span>
            <span>{{ formatDifficulty(question.difficulty) }}</span>
          </div>
        </div>
        <QuestionStatusBadge :status="getQuestionStatus(question.id)" />
      </NuxtLink>
    </div>
  </div>
</template>
