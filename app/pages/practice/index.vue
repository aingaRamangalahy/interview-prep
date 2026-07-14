<script setup lang="ts">
import type { PracticeModePreset, Subcategory } from '~/types'
import { ALL_SUBCATEGORIES, PRACTICE_MODE_OPTIONS } from '~/utils/categories'

const { state, updateSettings } = useReviewState()
const { pending } = useQuestions()
const { startSession, dueCountForMode } = usePracticeSession()

const QUICK_MODES: PracticeModePreset[] = ['mixed', 'technical', 'non-technical']
const quickPresets = computed(() => PRACTICE_MODE_OPTIONS.filter(option => QUICK_MODES.includes(option.value)))

const selectedMode = ref<PracticeModePreset>(state.value.settings.defaultPracticeMode)
const selectedTopics = ref<Subcategory[]>(initialTopics())

function initialTopics(): Subcategory[] {
  const mode = state.value.settings.defaultPracticeMode
  if (mode === 'custom') return [...state.value.settings.customSubcategories]
  if ((ALL_SUBCATEGORIES as string[]).includes(mode)) return [mode as Subcategory]
  return []
}

watch(selectedMode, (mode) => {
  updateSettings({ defaultPracticeMode: mode })
})

watch(selectedTopics, (topics) => {
  updateSettings({ customSubcategories: [...topics] })
}, { deep: true })

const isCustomActive = computed(() => selectedMode.value === 'custom')

function selectPreset(mode: PracticeModePreset) {
  selectedMode.value = mode
  selectedTopics.value = []
}

function handleTopicsUpdate(topics: Subcategory[]) {
  selectedTopics.value = topics
  selectedMode.value = topics.length > 0 ? 'custom' : 'mixed'
}

const dueCount = computed(() => dueCountForMode(selectedMode.value))

function beginSession() {
  useState<unknown>('session-summary', () => null).value = null
  const count = startSession(selectedMode.value)
  if (count === 0) return
  navigateTo('/practice/session')
}
</script>

<template>
  <div class="space-y-6">
    <section class="space-y-2 rounded-2xl border border-default/80 bg-elevated/35 p-5 sm:p-6">
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        Practice
      </h1>
      <p class="text-sm text-muted sm:text-base">
        Choose a mode and start today's session.
      </p>
    </section>

    <div class="grid gap-3 sm:grid-cols-3">
      <button
        v-for="option in quickPresets"
        :key="option.value"
        type="button"
        class="rounded-2xl border border-default bg-elevated/30 p-4 text-left transition-all hover:border-primary/35 hover:bg-elevated/55"
        :class="!isCustomActive && selectedMode === option.value ? 'border-primary ring-1 ring-primary/35 bg-primary/6' : ''"
        @click="selectPreset(option.value)"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="font-medium text-highlighted">
              {{ option.label }}
            </div>
            <div
              v-if="option.description"
              class="mt-1 text-sm text-muted"
            >
              {{ option.description }}
            </div>
          </div>
          <UIcon
            v-if="!isCustomActive && selectedMode === option.value"
            name="i-lucide-check-circle-2"
            class="size-5 shrink-0 text-primary"
          />
        </div>
      </button>
    </div>

    <div
      class="space-y-3 rounded-2xl border border-default/80 bg-elevated/30 p-4 sm:p-5"
      :class="isCustomActive ? 'border-primary/35 bg-primary/6' : ''"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-medium text-highlighted">
            Or combine specific topics
          </p>
          <p class="text-xs text-muted">
            Pick one or more, e.g. JavaScript + TypeScript.
          </p>
        </div>
        <UBadge
          v-if="isCustomActive"
          color="primary"
          variant="subtle"
        >
          Custom
        </UBadge>
      </div>

      <TopicChips
        :model-value="selectedTopics"
        :options="ALL_SUBCATEGORIES"
        @update:model-value="handleTopicsUpdate"
      />
    </div>

    <UCard class="border-primary/20">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-muted">
            Ready for review
          </p>
          <p class="text-xl font-semibold text-highlighted">
            {{ dueCount }} question{{ dueCount === 1 ? '' : 's' }}
          </p>
        </div>

        <UButton
          size="lg"
          :loading="pending"
          :disabled="dueCount === 0"
          icon="i-lucide-play"
          @click="beginSession"
        >
          Start Session
        </UButton>
      </div>

      <p
        v-if="dueCount === 0 && !pending"
        class="mt-3 text-sm text-muted"
      >
        No questions are due for this mode yet. Try a different mode or add more questions.
      </p>
    </UCard>
  </div>
</template>
