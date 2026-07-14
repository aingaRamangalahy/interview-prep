<script setup lang="ts">
import type { Subcategory } from '~/types'
import { formatSubcategory, SUBCATEGORY_ICONS } from '~/utils/categories'

const { modelValue, options } = defineProps<{
  modelValue: Subcategory[]
  options: Subcategory[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Subcategory[]]
}>()

function toggle(subcategory: Subcategory) {
  const next = modelValue.includes(subcategory)
    ? modelValue.filter(s => s !== subcategory)
    : [...modelValue, subcategory]
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <UButton
      v-for="subcategory in options"
      :key="subcategory"
      size="sm"
      class="rounded-full"
      :color="modelValue.includes(subcategory) ? 'primary' : 'neutral'"
      :variant="modelValue.includes(subcategory) ? 'solid' : 'soft'"
      :icon="SUBCATEGORY_ICONS[subcategory]"
      @click="toggle(subcategory)"
    >
      {{ formatSubcategory(subcategory) }}
    </UButton>
  </div>
</template>
