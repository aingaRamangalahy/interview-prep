<script setup lang="ts">
import type { Difficulty, QuestionStatus, Subcategory } from '~/types'
import { ALL_SUBCATEGORIES, DIFFICULTY_COLORS, formatDifficulty, formatSubcategory, SUBCATEGORY_ICONS } from '~/utils/categories'

useSiteSeo({
  title: 'Interview Question Library',
  description: 'Browse JavaScript, TypeScript, Vue, Node.js, and behavioral interview questions with detailed ideal answers.',
  path: '/questions',
  og: {
    title: 'Interview Question Library',
    description: 'Searchable library of interview questions with ideal answers for JavaScript and frontend roles.',
    eyebrow: 'Question Library'
  }
})

const toast = useToast()
const search = ref('')
const subcategory = ref<Subcategory | 'all'>('all')
const difficulty = ref<'all' | 'easy' | 'medium' | 'hard'>('all')
const status = ref<QuestionStatus | 'all'>('all')
const showCreateModal = ref(false)
const createMode = ref<'single' | 'json'>('single')

const newTitle = ref('')
const newSubcategory = ref<Subcategory>('javascript')
const newDifficulty = ref<Difficulty>('medium')
const newHint = ref('')
const newAnswer = ref('')
const newTags = ref('')
const isCreating = ref(false)
const importJson = ref('')
const isImporting = ref(false)

const { pending, createQuestions } = useQuestions()
const { filterQuestions, getQuestionStatus } = useStatistics()
const { isMuted, toggleMute } = useReviewState()
const { isAdmin, isVisitor } = useAuth()

const filteredQuestions = computed(() =>
  filterQuestions(search.value, subcategory.value, difficulty.value, status.value)
)

const hasActiveFilters = computed(() =>
  search.value.trim() !== '' || subcategory.value !== 'all' || difficulty.value !== 'all' || status.value !== 'all'
)

function clearFilters() {
  search.value = ''
  subcategory.value = 'all'
  difficulty.value = 'all'
  status.value = 'all'
}

const jsonExample = `[
  {
    "title": "Explain closures in JavaScript",
    "subcategory": "javascript",
    "difficulty": "medium",
    "hint": "Think about lexical scope and returned functions",
    "answer": "A closure is created when an inner function keeps access to variables from its outer scope...",
    "tags": ["javascript", "core-concepts"]
  },
  {
    "slug": "behavioral-conflict-resolution",
    "title": "Tell me about a conflict you resolved",
    "subcategory": "behavioral",
    "difficulty": "easy",
    "answer": "Use STAR: Situation, Task, Action, Result..."
  }
]`

function resetSingleForm() {
  newTitle.value = ''
  newSubcategory.value = 'javascript'
  newDifficulty.value = 'medium'
  newHint.value = ''
  newAnswer.value = ''
  newTags.value = ''
}

async function handleCreateSingle() {
  if (isCreating.value) return
  if (!newTitle.value.trim() || !newAnswer.value.trim()) {
    toast.add({ title: 'Title and answer are required', color: 'warning' })
    return
  }

  try {
    isCreating.value = true
    const response = await createQuestions({
      title: newTitle.value.trim(),
      subcategory: newSubcategory.value,
      difficulty: newDifficulty.value,
      hint: newHint.value.trim() || undefined,
      answer: newAnswer.value.trim(),
      tags: newTags.value
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
    })
    resetSingleForm()
    showCreateModal.value = false
    toast.add({
      title: response.created > 0 ? 'Question added' : 'Question updated',
      color: 'success'
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save question'
    toast.add({ title: message, color: 'error' })
  } finally {
    isCreating.value = false
  }
}

async function handleImportJson() {
  if (isImporting.value) return
  if (!importJson.value.trim()) {
    toast.add({ title: 'Paste JSON first', color: 'warning' })
    return
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(importJson.value)
  } catch {
    toast.add({ title: 'Invalid JSON format', color: 'error' })
    return
  }

  try {
    isImporting.value = true
    const response = await createQuestions(parsed as never)
    importJson.value = ''
    showCreateModal.value = false
    toast.add({
      title: `Imported ${response.created} new, updated ${response.updated}`,
      color: 'success'
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to import questions'
    toast.add({ title: message, color: 'error' })
  } finally {
    isImporting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="rounded-2xl border border-default/80 bg-elevated/35 p-5 sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="space-y-2">
          <h1 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
            Questions
          </h1>
          <p class="text-sm text-muted sm:text-base">
            Browse JavaScript, TypeScript, Vue, and behavioral interview questions with ideal answers.
          </p>
        </div>

        <UButton
          v-if="isAdmin"
          icon="i-lucide-plus"
          @click="showCreateModal = true"
        >
          Add Questions
        </UButton>
      </div>
    </section>

    <UCard>
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-highlighted">
            Filter library
          </p>
          <div class="flex items-center gap-2">
            <UButton
              v-if="hasActiveFilters"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-x"
              @click="clearFilters"
            >
              Clear
            </UButton>
            <UBadge
              color="neutral"
              variant="soft"
            >
              {{ filteredQuestions.length }} result{{ filteredQuestions.length === 1 ? '' : 's' }}
            </UBadge>
          </div>
        </div>

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
      </div>
    </UCard>

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
      class="rounded-2xl border border-dashed border-default p-10 text-center"
    >
      <UIcon
        name="i-lucide-search-x"
        class="mx-auto mb-3 size-6 text-muted"
      />
      <p class="text-sm text-muted">
        No questions match these filters.
      </p>
      <UButton
        v-if="hasActiveFilters"
        class="mt-3"
        color="neutral"
        variant="soft"
        size="sm"
        @click="clearFilters"
      >
        Clear filters
      </UButton>
    </div>

    <div
      v-else
      class="space-y-2"
    >
      <div
        v-for="question in filteredQuestions"
        :key="question.id"
        class="group flex items-center justify-between gap-4 rounded-2xl border border-default bg-elevated/20 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-elevated/45"
      >
        <NuxtLink
          :to="`/questions/${question.id}`"
          class="min-w-0 flex-1 space-y-1.5"
        >
          <p class="truncate font-medium text-highlighted">
            {{ question.title }}
          </p>
          <div class="flex flex-wrap items-center gap-1.5">
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
              :icon="SUBCATEGORY_ICONS[question.subcategory]"
            >
              {{ formatSubcategory(question.subcategory) }}
            </UBadge>
            <UBadge
              :color="DIFFICULTY_COLORS[question.difficulty]"
              variant="subtle"
              size="sm"
            >
              {{ formatDifficulty(question.difficulty) }}
            </UBadge>
            <UBadge
              v-if="isAdmin && question.status === 'archived'"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-lucide-archive"
            >
              Archived
            </UBadge>
            <UBadge
              v-if="!isVisitor && isMuted(question.id)"
              color="neutral"
              variant="soft"
              size="sm"
              icon="i-lucide-bell-off"
            >
              Muted
            </UBadge>
          </div>
        </NuxtLink>
        <div class="flex items-center gap-2">
          <UButton
            v-if="!isVisitor"
            :icon="isMuted(question.id) ? 'i-lucide-bell' : 'i-lucide-bell-off'"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            :aria-label="isMuted(question.id) ? 'Unmute question' : 'Mute question'"
            @click="toggleMute(question.id)"
          />
          <QuestionStatusBadge :status="getQuestionStatus(question.id)" />
          <NuxtLink :to="`/questions/${question.id}`">
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-muted transition-transform group-hover:translate-x-0.5"
            />
          </NuxtLink>
        </div>
      </div>
    </div>

    <UModal v-model:open="showCreateModal">
      <template #content>
        <UCard class="w-full max-w-3xl">
          <div class="space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="text-lg font-semibold text-highlighted">
                Add Questions
              </h2>
              <div class="flex gap-2">
                <UButton
                  size="sm"
                  :variant="createMode === 'single' ? 'solid' : 'soft'"
                  color="neutral"
                  @click="createMode = 'single'"
                >
                  One by one
                </UButton>
                <UButton
                  size="sm"
                  :variant="createMode === 'json' ? 'solid' : 'soft'"
                  color="neutral"
                  @click="createMode = 'json'"
                >
                  Import JSON
                </UButton>
              </div>
            </div>

            <div
              v-if="createMode === 'single'"
              class="space-y-4"
            >
              <UFormField label="Title">
                <UInput
                  v-model="newTitle"
                  class="w-full"
                  placeholder="Question title"
                />
              </UFormField>
              <div class="grid gap-3 sm:grid-cols-2">
                <UFormField label="Topic">
                  <USelect
                    v-model="newSubcategory"
                    class="w-full"
                    :items="ALL_SUBCATEGORIES.map(s => ({ label: formatSubcategory(s), value: s }))"
                  />
                </UFormField>
                <UFormField label="Difficulty">
                  <USelect
                    v-model="newDifficulty"
                    class="w-full"
                    :items="[
                      { label: 'Easy', value: 'easy' },
                      { label: 'Medium', value: 'medium' },
                      { label: 'Hard', value: 'hard' }
                    ]"
                  />
                </UFormField>
              </div>
              <UFormField
                label="Tags"
                hint="Optional"
              >
                <UInput
                  v-model="newTags"
                  class="w-full"
                  placeholder="Comma separated, e.g. closures, core-concepts"
                />
              </UFormField>
              <UFormField
                label="Hint"
                hint="Optional"
                description="Shown before revealing the answer during practice."
              >
                <UTextarea
                  v-model="newHint"
                  class="w-full"
                  :rows="3"
                  placeholder="Optional hint"
                />
              </UFormField>
              <UFormField
                label="Answer"
                description="Markdown supported."
              >
                <UTextarea
                  v-model="newAnswer"
                  class="w-full"
                  :rows="10"
                  placeholder="Ideal answer (markdown supported)"
                />
              </UFormField>
              <div class="flex justify-end gap-2">
                <UButton
                  color="neutral"
                  variant="ghost"
                  @click="showCreateModal = false"
                >
                  Cancel
                </UButton>
                <UButton
                  :loading="isCreating"
                  icon="i-lucide-save"
                  @click="handleCreateSingle"
                >
                  Save Question
                </UButton>
              </div>
            </div>

            <div
              v-else
              class="space-y-4"
            >
              <p class="text-sm text-muted">
                Paste a JSON array of questions. Existing slugs will update; missing slugs are auto-generated.
              </p>

              <UCard class="bg-elevated/35">
                <p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  JSON Format Example
                </p>
                <pre class="overflow-x-auto rounded-lg border border-default/70 bg-default/70 p-3 text-xs text-toned">{{ jsonExample }}</pre>
              </UCard>

              <UTextarea
                v-model="importJson"
                class="w-full"
                :rows="14"
                placeholder="Paste your JSON here..."
              />

              <div class="flex justify-end gap-2">
                <UButton
                  color="neutral"
                  variant="ghost"
                  @click="showCreateModal = false"
                >
                  Cancel
                </UButton>
                <UButton
                  :loading="isImporting"
                  icon="i-lucide-upload"
                  @click="handleImportJson"
                >
                  Import Questions
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
