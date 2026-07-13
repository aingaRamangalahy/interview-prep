<script setup lang="ts">
import type { Rating } from '@interview-prep/shared'
import { RATING_LABELS } from '@interview-prep/shared'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  rate: [rating: Rating]
}>()

const ratings: Rating[] = ['again', 'hard', 'good', 'easy']
</script>

<template>
  <div class="rating-grid">
    <button
      v-for="(rating, index) in ratings"
      :key="rating"
      type="button"
      class="rating-btn"
      :disabled="disabled"
      @click="emit('rate', rating)"
    >
      <span class="rating-emoji">{{ RATING_LABELS[rating].emoji }}</span>
      <span class="rating-text">
        <span class="rating-label">{{ RATING_LABELS[rating].label }}</span>
        <span class="rating-desc">{{ RATING_LABELS[rating].description }}</span>
      </span>
      <kbd class="rating-kbd">{{ index + 1 }}</kbd>
    </button>
  </div>
</template>
