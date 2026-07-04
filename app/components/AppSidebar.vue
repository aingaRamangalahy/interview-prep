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
  <aside class="hidden lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:flex-col lg:border-r lg:border-default/80 lg:bg-default/60 lg:px-4 lg:py-6">
    <NuxtLink
      to="/"
      class="mb-8 rounded-xl border border-default/80 bg-elevated/50 px-4 py-3"
    >
      <p class="text-lg font-semibold tracking-tight text-highlighted">
        Interview Prep
      </p>
    </NuxtLink>

    <nav class="flex flex-1 flex-col gap-1">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all"
        :class="isActive(link.to)
          ? 'bg-primary/12 text-primary font-medium shadow-sm'
          : 'text-muted hover:bg-elevated/80 hover:text-highlighted'"
      >
        <UIcon
          :name="link.icon"
          class="size-4 transition-transform group-hover:scale-110"
        />
        {{ link.label }}
      </NuxtLink>
    </nav>

    <UCard class="mt-5 bg-elevated/40">
      <p class="text-xs text-muted">
        Tip of the day
      </p>
      <p class="mt-1 text-sm text-highlighted">
        Keep sessions short and daily for stronger long-term recall.
      </p>
    </UCard>
  </aside>
</template>
