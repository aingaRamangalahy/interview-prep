<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const route = useRoute()
const { user, isVisitor, isAdmin, signOut } = useAuth()

const links = computed(() => {
  const items = [
    { label: 'Practice', to: '/practice', icon: 'i-lucide-play-circle' },
    { label: 'Questions', to: '/questions', icon: 'i-lucide-library' }
  ]

  if (!isVisitor.value) {
    items.push(
      { label: 'Statistics', to: '/statistics', icon: 'i-lucide-bar-chart-3' },
      { label: 'Settings', to: '/settings', icon: 'i-lucide-settings' }
    )
  }

  if (isAdmin.value) {
    items.push({ label: 'Manage Users', to: '/admin/users', icon: 'i-lucide-users' })
  }

  return items
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function go(to: string) {
  open.value = false
  navigateTo(to)
}

async function handleSignOut() {
  await signOut()
  open.value = false
  navigateTo('/')
}
</script>

<template>
  <USlideover
    v-model:open="open"
    title="Menu"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <div
          v-if="user"
          class="flex items-center gap-3 rounded-xl border border-default/70 bg-elevated/40 p-3"
        >
          <UAvatar
            :src="user.avatarUrl"
            :alt="user.name || user.login"
            size="md"
          />
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-highlighted">
              {{ user.name || user.login }}
            </p>
            <UBadge
              size="sm"
              :color="isAdmin ? 'primary' : 'neutral'"
              variant="subtle"
              class="mt-0.5"
            >
              {{ user.role }}
            </UBadge>
          </div>
        </div>

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

        <template v-if="!isVisitor">
          <USeparator />

          <UButton
            color="neutral"
            variant="soft"
            icon="i-lucide-log-out"
            block
            @click="handleSignOut"
          >
            Sign out
          </UButton>
        </template>
      </div>
    </template>
  </USlideover>
</template>
