<script setup lang="ts">
import type { Rating } from '~/types'
import { RATING_LABELS } from '~/utils/srs'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  rate: [rating: Rating]
}>()

const ratings: Rating[] = ['again', 'hard', 'good', 'easy']
</script>

<template>
  <div class="grid gap-2 sm:grid-cols-2">
    <UButton
      v-for="(rating, index) in ratings"
      :key="rating"
      :color="RATING_LABELS[rating].color"
      :icon="RATING_LABELS[rating].icon"
      variant="soft"
      size="lg"
      class="justify-start"
      :disabled="disabled"
      @click="emit('rate', rating)"
    >
      <span class="flex flex-col items-start">
        <span class="font-medium">{{ RATING_LABELS[rating].label }}</span>
        <span class="text-xs text-muted">{{ RATING_LABELS[rating].description }}</span>
      </span>
      <UKbd
        class="ml-auto hidden sm:inline-flex"
        size="sm"
      >
        {{ index + 1 }}
      </UKbd>
    </UButton>
  </div>
</template>
