<script setup lang="ts">
const route = useRoute()

const links = [
  { label: 'Dashboard', to: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Practice', to: '/practice', icon: 'i-lucide-play-circle' },
  { label: 'Questions', to: '/questions', icon: 'i-lucide-library' },
  { label: 'Statistics', to: '/statistics', icon: 'i-lucide-bar-chart-3' },
  { label: 'Settings', to: '/settings', icon: 'i-lucide-settings' }
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-default lg:bg-elevated/30 lg:px-4 lg:py-6">
    <NuxtLink
      to="/"
      class="mb-8 px-2 text-lg font-semibold tracking-tight text-highlighted"
    >
      Interview Prep
    </NuxtLink>

    <nav class="flex flex-1 flex-col gap-1">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
        :class="isActive(link.to)
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted hover:bg-elevated hover:text-highlighted'"
      >
        <UIcon
          :name="link.icon"
          class="size-4"
        />
        {{ link.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>
