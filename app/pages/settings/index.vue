<script setup lang="ts">
import type { PracticeModePreset, Subcategory } from '~/types'
import { ALL_SUBCATEGORIES, PRACTICE_MODE_OPTIONS } from '~/utils/categories'

const { state, updateSettings, exportState, importState, resetProgress } = useReviewState()

const sessionSize = ref(state.value.settings.sessionSize)
const defaultMode = ref<PracticeModePreset>(state.value.settings.defaultPracticeMode)
const customSubcategories = ref<Subcategory[]>([...state.value.settings.customSubcategories])
const importText = ref('')
const showResetConfirm = ref(false)

watch(sessionSize, (value) => {
  updateSettings({ sessionSize: value })
})

watch(defaultMode, (value) => {
  updateSettings({ defaultPracticeMode: value })
})

watch(customSubcategories, (value) => {
  updateSettings({ customSubcategories: [...value] })
}, { deep: true })

function downloadExport() {
  const blob = new Blob([exportState()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `flashtab-backup-${new Date().toISOString().slice(0, 10)}.json`
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
      <div class="mb-4 flex items-center gap-2 text-highlighted">
        <UIcon
          name="i-lucide-sliders-horizontal"
          class="size-4 shrink-0"
        />
        <p class="font-medium">
          Practice defaults
        </p>
      </div>

      <div class="space-y-5">
        <UFormField
          label="Session size"
          description="Recommended: 5-12 questions for a focused daily session."
        >
          <UInputNumber
            v-model="sessionSize"
            :min="1"
            :max="20"
          />
        </UFormField>

        <UFormField label="Default practice mode">
          <USelect
            v-model="defaultMode"
            class="w-full"
            :items="PRACTICE_MODE_OPTIONS.map(o => ({ label: o.label, value: o.value }))"
          />
        </UFormField>
      </div>
    </UCard>

    <UCard
      v-if="defaultMode === 'custom'"
      class="border-primary/20"
    >
      <div class="mb-4 flex items-center gap-2 text-highlighted">
        <UIcon
          name="i-lucide-tags"
          class="size-4 shrink-0"
        />
        <p class="font-medium">
          Custom topics
        </p>
      </div>
      <p class="mb-3 text-sm text-muted">
        Choose one or more subcategories to combine, e.g. JavaScript + TypeScript.
      </p>
      <TopicChips
        v-model="customSubcategories"
        :options="ALL_SUBCATEGORIES"
      />
    </UCard>

    <UCard>
      <div class="mb-4 flex items-center gap-2 text-highlighted">
        <UIcon
          name="i-lucide-database"
          class="size-4 shrink-0"
        />
        <p class="font-medium">
          Data
        </p>
      </div>

      <div class="space-y-5">
        <div>
          <p class="text-sm font-medium text-highlighted">
            Export progress
          </p>
          <p class="mt-1 text-sm text-muted">
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

        <UFormField
          label="Import progress"
          description="Paste the JSON from a previous export and restore your history."
        >
          <UTextarea
            v-model="importText"
            class="w-full"
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
        </UFormField>
      </div>
    </UCard>

    <UCard class="border-error/25">
      <div class="mb-1 flex items-center gap-2 text-error">
        <UIcon
          name="i-lucide-triangle-alert"
          class="size-4 shrink-0"
        />
        <p class="font-medium">
          Danger zone
        </p>
      </div>
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
