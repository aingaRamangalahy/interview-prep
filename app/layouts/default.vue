<script setup lang="ts">
const route = useRoute()
const navOpen = ref(false)
const { isVisitor, signIn } = useAuth()

const routeTitles: Record<string, string> = {
  '/practice': 'Practice',
  '/practice/session': 'Practice Session',
  '/practice/complete': 'Session Complete',
  '/questions': 'Question Library',
  '/statistics': 'Statistics',
  '/settings': 'Settings',
  '/admin/users': 'Manage Users'
}

const isRoot = computed(() => route.path === '/')

const pageTitle = computed(() => {
  if (route.path.startsWith('/questions/')) return 'Question Details'
  return routeTitles[route.path] || 'javascriptinterview.dev'
})
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-default">
    <header class="sticky top-0 z-30 border-b border-default/80 bg-default/85 px-4 py-3 backdrop-blur lg:px-8">
      <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
        <div class="flex items-center gap-1.5">
          <NuxtLink
            to="/"
            class="flex items-center gap-2 rounded-lg transition-opacity hover:opacity-70"
          >
            <AppLogo class="size-6 shrink-0" />
            <span class="font-mono text-sm font-medium tracking-tight text-highlighted lg:text-base">
              javascriptinterview.dev
            </span>
          </NuxtLink>
          <div
            v-if="!isRoot"
            class="hidden items-center gap-1.5 sm:flex"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="size-3.5 shrink-0 text-dimmed"
            />
            <span class="text-xs text-muted lg:text-sm">
              {{ pageTitle }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-1.5">
          <UButton
            v-if="isVisitor"
            icon="i-simple-icons-github"
            color="neutral"
            variant="soft"
            size="sm"
            @click="signIn"
          >
            Sign in
          </UButton>
          <UColorModeButton />
          <UButton
            icon="i-lucide-settings"
            color="neutral"
            variant="ghost"
            square
            aria-label="Open menu"
            @click="navOpen = true"
          />
        </div>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <slot />
      </div>
    </main>

    <AppNavDrawer v-model:open="navOpen" />
    <AppGuestMergePrompt />
  </div>
</template>
