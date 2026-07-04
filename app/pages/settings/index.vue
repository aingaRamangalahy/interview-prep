<script setup lang="ts">
import type { PracticeModePreset, Subcategory } from '~/types'
import { ALL_SUBCATEGORIES, formatSubcategory, PRACTICE_MODE_OPTIONS } from '~/utils/categories'

const { state, updateSettings, exportState, importState, resetProgress } = useReviewState()

const sessionSize = ref(state.value.settings.sessionSize)
const defaultMode = ref<PracticeModePreset>(state.value.settings.defaultPracticeMode)
const customSubcategories = ref<Subcategory[]>([...state.value.settings.customSubcategories])
const importText = ref('')
const showResetConfirm = ref(false)

watch(sessionSize, (value) => {
  updateSettings({ sessionSize: Math.min(20, Math.max(1, value)) })
})

watch(defaultMode, (value) => {
  updateSettings({ defaultPracticeMode: value })
})

watch(customSubcategories, (value) => {
  updateSettings({ customSubcategories: [...value] })
}, { deep: true })

function toggleSubcategory(subcategory: Subcategory) {
  if (customSubcategories.value.includes(subcategory)) {
    customSubcategories.value = customSubcategories.value.filter(s => s !== subcategory)
  } else {
    customSubcategories.value = [...customSubcategories.value, subcategory]
  }
}

function downloadExport() {
  const blob = new Blob([exportState()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `interview-prep-backup-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function handleImport() {
  if (!importText.value.trim()) return
  importState(importText.value)
    .then(() => {
      importText.value = ''
      useToast().add({ title: 'Progress imported', color: 'success' })
    })
    .catch(() => {
      useToast().add({ title: 'Invalid backup file', color: 'error' })
    })
}

function handleReset() {
  resetProgress()
    .then(() => {
      showResetConfirm.value = false
      useToast().add({ title: 'Progress reset', color: 'warning' })
    })
    .catch(() => {
      useToast().add({ title: 'Failed to reset progress', color: 'error' })
    })
}
</script>

<template>
  <div class="space-y-8">
    <section class="space-y-2 rounded-2xl border border-default/80 bg-elevated/35 p-5 sm:p-6">
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        Settings
      </h1>
      <p class="text-sm text-muted sm:text-base">
        Customize your daily practice defaults.
      </p>
    </section>

    <UCard>
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium">Session size</label>
          <UInput
            v-model.number="sessionSize"
            type="number"
            min="1"
            max="20"
            class="mt-2"
          />
          <p class="mt-1 text-xs text-muted">
            Recommended: 5-12 questions for a focused daily session.
          </p>
        </div>

        <div>
          <label class="text-sm font-medium">Default practice mode</label>
          <USelect
            v-model="defaultMode"
            class="mt-2"
            :items="PRACTICE_MODE_OPTIONS.map(o => ({ label: o.label, value: o.value }))"
          />
        </div>
      </div>
    </UCard>

    <UCard
      v-if="defaultMode === 'custom'"
      class="border-primary/20"
    >
      <p class="mb-3 text-sm font-medium">
        Custom topics
      </p>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="subcategory in ALL_SUBCATEGORIES"
          :key="subcategory"
          size="sm"
          :color="customSubcategories.includes(subcategory) ? 'primary' : 'neutral'"
          :variant="customSubcategories.includes(subcategory) ? 'solid' : 'soft'"
          @click="toggleSubcategory(subcategory)"
        >
          {{ formatSubcategory(subcategory) }}
        </UButton>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-4">
        <div>
          <p class="font-medium">
            Export progress
          </p>
          <p class="text-sm text-muted">
            Download your review history and streak data from MongoDB.
          </p>
          <UButton
            class="mt-3"
            color="neutral"
            variant="soft"
            icon="i-lucide-download"
            @click="downloadExport"
          >
            Export JSON
          </UButton>
        </div>

        <USeparator />

        <div>
          <p class="font-medium">
            Import progress
          </p>
          <p class="mt-1 text-sm text-muted">
            Paste the JSON from a previous export and restore your history.
          </p>
          <UTextarea
            v-model="importText"
            class="mt-2"
            :rows="4"
            placeholder="Paste exported JSON..."
          />
          <UButton
            class="mt-3"
            color="neutral"
            variant="soft"
            icon="i-lucide-upload"
            @click="handleImport"
          >
            Import
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard class="border-error/25">
      <p class="font-medium text-error">
        Danger zone
      </p>
      <p class="mt-1 text-sm text-muted">
        Reset all review progress. Settings are kept.
      </p>
      <UButton
        class="mt-3"
        color="error"
        variant="soft"
        @click="showResetConfirm = true"
      >
        Reset progress
      </UButton>
    </UCard>

    <UModal v-model:open="showResetConfirm">
      <template #content>
        <UCard>
          <p class="font-medium">
            Reset all progress?
          </p>
          <p class="mt-2 text-sm text-muted">
            This cannot be undone.
          </p>
          <div class="mt-4 flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="showResetConfirm = false"
            >
              Cancel
            </UButton>
            <UButton
              color="error"
              @click="handleReset"
            >
              Reset
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
