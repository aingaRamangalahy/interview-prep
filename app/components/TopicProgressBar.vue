<script setup lang="ts">
defineProps<{
  label: string
  progress: number
  icon?: string
}>()
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between text-sm">
      <span class="flex items-center gap-1.5 text-muted">
        <UIcon
          v-if="icon"
          :name="icon"
          class="size-3.5 shrink-0"
        />
        {{ label }}
      </span>
      <span class="font-medium text-highlighted">{{ progress }}%</span>
    </div>
    <UProgress
      :model-value="progress"
      size="sm"
    />
  </div>
</template>
