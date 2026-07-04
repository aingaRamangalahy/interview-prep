<script setup lang="ts">
const route = useRoute()

const links = [
  { label: 'Home', to: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Practice', to: '/practice', icon: 'i-lucide-play-circle' },
  { label: 'Questions', to: '/questions', icon: 'i-lucide-library' },
  { label: 'Stats', to: '/statistics', icon: 'i-lucide-bar-chart-3' },
  { label: 'Settings', to: '/settings', icon: 'i-lucide-settings' }
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-50 border-t border-default/80 bg-default/90 backdrop-blur lg:hidden">
    <div class="mx-auto flex max-w-xl items-stretch justify-around px-2 py-2">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] transition-colors"
        :class="isActive(link.to) ? 'bg-primary/12 text-primary' : 'text-muted'"
      >
        <UIcon
          :name="link.icon"
          class="size-5"
        />
        {{ link.label }}
      </NuxtLink>
    </div>
  </nav>
</template>
