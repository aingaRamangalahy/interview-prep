<script setup lang="ts">
import type { PracticeModePreset } from '~/types'
import { PRACTICE_MODE_OPTIONS } from '~/utils/categories'

const { state, updateSettings } = useReviewState()
const { pending } = useQuestions()
const { startSession, dueCountForMode } = usePracticeSession()

const selectedMode = ref<PracticeModePreset>(state.value.settings.defaultPracticeMode)

watch(selectedMode, (mode) => {
  updateSettings({ defaultPracticeMode: mode })
})

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
    <section class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted">
        Practice
      </h1>
      <p class="text-muted">
        Choose a mode and start today's session.
      </p>
    </section>

    <div class="grid gap-3">
      <button
        v-for="option in PRACTICE_MODE_OPTIONS"
        :key="option.value"
        type="button"
        class="rounded-xl border border-default bg-elevated/40 p-4 text-left transition-colors hover:border-primary/40"
        :class="selectedMode === option.value ? 'border-primary ring-1 ring-primary/30' : ''"
        @click="selectedMode = option.value"
      >
        <div class="font-medium text-highlighted">
          {{ option.label }}
        </div>
        <div
          v-if="option.description"
          class="mt-1 text-sm text-muted"
        >
          {{ option.description }}
        </div>
      </button>
    </div>

    <UCard>
      <div class="space-y-4">
        <div>
          <p class="text-sm text-muted">
            Ready for review
          </p>
          <p class="text-lg font-semibold">
            {{ dueCount }} question{{ dueCount === 1 ? '' : 's' }}
          </p>
        </div>

        <UButton
          size="lg"
          block
          :loading="pending"
          :disabled="dueCount === 0"
          @click="beginSession"
        >
          Start Session
        </UButton>

        <p
          v-if="dueCount === 0 && !pending"
          class="text-sm text-muted"
        >
          No questions due for this mode. Try another mode or add more questions.
        </p>
      </div>
    </UCard>
  </div>
</template>
