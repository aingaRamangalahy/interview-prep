<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const route = useRoute()

const links = [
  { label: 'Practice', to: '/practice', icon: 'i-lucide-play-circle' },
  { label: 'Questions', to: '/questions', icon: 'i-lucide-library' },
  { label: 'Statistics', to: '/statistics', icon: 'i-lucide-bar-chart-3' },
  { label: 'Settings', to: '/settings', icon: 'i-lucide-settings' }
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function go(to: string) {
  open.value = false
  navigateTo(to)
}
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Menu"
  >
    <template #body>
      <nav class="flex flex-col gap-1">
        <button
          v-for="link in links"
          :key="link.to"
          type="button"
          class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors"
          :class="isActive(link.to)
            ? 'bg-accented font-medium text-highlighted'
            : 'text-muted hover:bg-elevated hover:text-highlighted'"
          @click="go(link.to)"
        >
          <UIcon
            :name="link.icon"
            class="size-4"
          />
          {{ link.label }}
        </button>
      </nav>
    </template>
  </USlideover>
</template>
