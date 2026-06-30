<script setup lang="ts">
import type { QuestionStatus } from '~/types'

defineProps<{
  status: QuestionStatus
}>()

const labels: Record<QuestionStatus, { label: string, color: 'info' | 'warning' | 'success' | 'neutral' }> = {
  new: { label: 'New', color: 'info' },
  due: { label: 'Due', color: 'warning' },
  mastered: { label: 'Mastered', color: 'success' },
  scheduled: { label: 'Scheduled', color: 'neutral' }
}
</script>

<template>
  <UBadge
    :color="labels[status].color"
    variant="subtle"
    size="sm"
  >
    {{ labels[status].label }}
  </UBadge>
</template>
