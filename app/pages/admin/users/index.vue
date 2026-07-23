<script setup lang="ts">
import type { AuthUser, UserRole } from '~/types'

definePageMeta({
  middleware: 'auth'
})

useSiteSeo({
  title: 'Manage Users',
  description: 'Admin user management.',
  noindex: true
})

interface AdminUser extends AuthUser {
  createdAt: string
  lastLoginAt: string
}

const toast = useToast()
const { user: currentUser } = useAuth()

const requestFetch = useRequestFetch()
const { data: users, pending, refresh } = await useAsyncData('admin-users', () =>
  requestFetch<AdminUser[]>('/api/admin/users')
)

const actionPendingId = ref<string | null>(null)
const removeTarget = ref<AdminUser | null>(null)
const removing = ref(false)

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

async function setRole(target: AdminUser, role: UserRole) {
  if (actionPendingId.value) return

  actionPendingId.value = target.id
  try {
    await $fetch(`/api/admin/users/${target.id}`, {
      method: 'PATCH',
      body: { role }
    })
    await refresh()
    toast.add({
      title: role === 'admin' ? `Promoted @${target.login}` : `Demoted @${target.login}`,
      color: 'success'
    })
  } catch (error: unknown) {
    const message = (error as { data?: { statusMessage?: string } })?.data?.statusMessage
      ?? 'Failed to update role'
    toast.add({ title: message, color: 'error' })
  } finally {
    actionPendingId.value = null
  }
}

async function confirmRemove() {
  if (!removeTarget.value || removing.value) return

  removing.value = true
  try {
    await $fetch(`/api/admin/users/${removeTarget.value.id}`, { method: 'DELETE' })
    const removedLogin = removeTarget.value.login
    removeTarget.value = null
    await refresh()
    toast.add({ title: `Removed @${removedLogin}`, color: 'warning' })
  } catch (error: unknown) {
    const message = (error as { data?: { statusMessage?: string } })?.data?.statusMessage
      ?? 'Failed to remove user'
    toast.add({ title: message, color: 'error' })
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="space-y-2 rounded-2xl border border-default/80 bg-elevated/35 p-5 sm:p-6">
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        Manage Users
      </h1>
      <p class="text-sm text-muted sm:text-base">
        Promote, demote, or remove accounts. Removing an account also deletes their progress.
      </p>
    </section>

    <div
      v-if="pending && !users"
      class="space-y-3"
    >
      <USkeleton class="h-20 w-full rounded-2xl" />
      <USkeleton class="h-20 w-full rounded-2xl" />
      <USkeleton class="h-20 w-full rounded-2xl" />
    </div>

    <div
      v-else-if="!users?.length"
      class="rounded-2xl border border-dashed border-default p-10 text-center text-sm text-muted"
    >
      No accounts yet.
    </div>

    <ul
      v-else
      class="space-y-3"
    >
      <li
        v-for="account in users"
        :key="account.id"
        class="flex flex-col gap-4 rounded-2xl border border-default/80 bg-elevated/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div class="flex min-w-0 items-center gap-3">
          <UAvatar
            :src="account.avatarUrl"
            :alt="account.name || account.login"
            size="md"
          />
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="truncate font-medium text-highlighted">
                {{ account.name || account.login }}
              </p>
              <UBadge
                size="sm"
                :color="account.role === 'admin' ? 'primary' : 'neutral'"
                variant="subtle"
              >
                {{ account.role }}
              </UBadge>
              <UBadge
                v-if="account.id === currentUser?.id"
                size="sm"
                color="neutral"
                variant="soft"
              >
                You
              </UBadge>
            </div>
            <p class="mt-0.5 truncate text-sm text-muted">
              @{{ account.login }}
              · last login {{ formatDate(account.lastLoginAt) }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 sm:justify-end">
          <UButton
            v-if="account.role === 'user'"
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-shield-plus"
            :loading="actionPendingId === account.id"
            @click="setRole(account, 'admin')"
          >
            Promote
          </UButton>
          <UButton
            v-else
            color="neutral"
            variant="soft"
            size="sm"
            icon="i-lucide-shield-off"
            :loading="actionPendingId === account.id"
            @click="setRole(account, 'user')"
          >
            Demote
          </UButton>
          <UButton
            color="error"
            variant="soft"
            size="sm"
            icon="i-lucide-trash-2"
            @click="removeTarget = account"
          >
            Remove
          </UButton>
        </div>
      </li>
    </ul>

    <UModal :open="!!removeTarget" @update:open="(open) => { if (!open) removeTarget = null }">
      <template #content>
        <UCard>
          <p class="font-medium text-highlighted">
            Remove @{{ removeTarget?.login }}?
          </p>
          <p class="mt-2 text-sm text-muted">
            This permanently deletes their account
            <strong class="font-medium text-highlighted">and their progress</strong>
            (streaks, reviews, and settings). This cannot be undone.
          </p>
          <div class="mt-4 flex justify-end gap-2">
            <UButton
              color="neutral"
              variant="ghost"
              @click="removeTarget = null"
            >
              Cancel
            </UButton>
            <UButton
              color="error"
              :loading="removing"
              @click="confirmRemove"
            >
              Remove account
            </UButton>
          </div>
        </UCard>
      </template>
    </UModal>
  </div>
</template>
