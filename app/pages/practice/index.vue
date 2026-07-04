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
    <section class="space-y-2 rounded-2xl border border-default/80 bg-elevated/35 p-5 sm:p-6">
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        Practice
      </h1>
      <p class="text-sm text-muted sm:text-base">
        Choose a mode and start today's session.
      </p>
    </section>

    <div class="grid gap-3">
      <button
        v-for="option in PRACTICE_MODE_OPTIONS"
        :key="option.value"
        type="button"
        class="rounded-2xl border border-default bg-elevated/30 p-4 text-left transition-all hover:border-primary/35 hover:bg-elevated/55"
        :class="selectedMode === option.value ? 'border-primary ring-1 ring-primary/35 bg-primary/6' : ''"
        @click="selectedMode = option.value"
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
            v-if="selectedMode === option.value"
            name="i-lucide-check-circle-2"
            class="size-5 text-primary"
          />
        </div>
      </button>
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
