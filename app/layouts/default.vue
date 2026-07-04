<script setup lang="ts">
const route = useRoute()

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/practice': 'Practice',
  '/practice/session': 'Practice Session',
  '/practice/complete': 'Session Complete',
  '/questions': 'Question Library',
  '/statistics': 'Statistics',
  '/settings': 'Settings'
}

const pageTitle = computed(() => {
  if (route.path.startsWith('/questions/')) return 'Question Details'
  return routeTitles[route.path] || 'Interview Prep'
})
</script>

<template>
  <div class="relative flex min-h-dvh bg-default">
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute left-[-10%] top-[-8%] h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
      <div class="absolute bottom-[-20%] right-[-8%] h-80 w-80 rounded-full bg-success/10 blur-3xl" />
    </div>

    <AppSidebar />

    <div class="flex min-h-dvh flex-1 flex-col">
      <header class="sticky top-0 z-30 border-b border-default/80 bg-default/85 px-4 py-3 backdrop-blur lg:px-8">
        <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Interview Prep
            </p>
            <h1 class="text-base font-semibold tracking-tight text-highlighted lg:text-lg">
              {{ pageTitle }}
            </h1>
          </div>
          <div class="flex items-center gap-2">
            <UBadge
              color="neutral"
              variant="soft"
              class="hidden sm:inline-flex"
            >
              Stay consistent
            </UBadge>
            <UColorModeButton />
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <div class="mx-auto max-w-5xl">
          <slot />
        </div>
      </main>

      <AppBottomNav />
    </div>
  </div>
</template>
