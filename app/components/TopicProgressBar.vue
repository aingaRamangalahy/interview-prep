<script setup lang="ts">
defineProps<{
  label: string
  progress: number
}>()
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between text-sm">
      <span class="text-muted">{{ label }}</span>
      <span class="font-medium text-highlighted">{{ progress }}%</span>
    </div>
    <UProgress
      :model-value="progress"
      size="sm"
    />
  </div>
</template>
