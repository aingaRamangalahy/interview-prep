<script setup lang="ts">
import type { AppState } from '~/types'
import { clearGuestState, GUEST_MERGE_DISMISSED_KEY, hasGuestProgress, mergeAppStates, readGuestState } from '~/utils/guest-state'

const { user } = useAuth()
const { state, hydrated } = useReviewState()
const toast = useToast()

const show = ref(false)
const merging = ref(false)
const guestSnapshot = ref<AppState | null>(null)

function maybePrompt() {
  if (!import.meta.client) return
  if (!user.value || !hydrated.value) return
  if (localStorage.getItem(GUEST_MERGE_DISMISSED_KEY)) return

  const guestState = readGuestState()
  if (!hasGuestProgress(guestState)) return

  guestSnapshot.value = guestState
  show.value = true
}

watch([user, hydrated], maybePrompt, { immediate: true })

function markDismissed() {
  if (import.meta.client) localStorage.setItem(GUEST_MERGE_DISMISSED_KEY, '1')
}

function dismiss() {
  show.value = false
  markDismissed()
}

async function confirmMerge() {
  if (!guestSnapshot.value || merging.value) return

  merging.value = true
  try {
    const merged = mergeAppStates(state.value, guestSnapshot.value)
    state.value = merged
    await $fetch('/api/state', { method: 'PUT', body: merged })
    clearGuestState()
    markDismissed()
    show.value = false
    toast.add({ title: 'Guest progress imported', color: 'success' })
  } catch {
    toast.add({ title: 'Failed to import guest progress', color: 'error' })
  } finally {
    merging.value = false
  }
}
</script>

<template>
  <UModal v-model:open="show">
    <template #content>
      <UCard>
        <p class="font-medium text-highlighted">
          Import your guest progress?
        </p>
        <p class="mt-2 text-sm text-muted">
          We found practice progress saved on this device from before you signed in. Import it into your account?
          For each question, the most recent review wins; muted questions are combined.
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            @click="dismiss"
          >
            Not now
          </UButton>
          <UButton
            :loading="merging"
            @click="confirmMerge"
          >
            Import
          </UButton>
        </div>
      </UCard>
    </template>
  </UModal>
</template>
