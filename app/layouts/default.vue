<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<template>
  <div class="flex min-h-dvh bg-default">
    <AppSidebar />

    <div class="flex min-h-dvh flex-1 flex-col">
      <header class="flex items-center justify-between border-b border-default px-4 py-3 lg:px-8">
        <div class="lg:hidden text-lg font-semibold tracking-tight">
          Interview Prep
        </div>
        <div class="ml-auto">
          <UColorModeButton />
        </div>
      </header>

      <main class="flex-1 overflow-y-auto px-4 py-6 pb-24 lg:px-8 lg:pb-8">
        <div class="mx-auto max-w-3xl">
          <slot />
        </div>
      </main>

      <AppBottomNav />
    </div>
  </div>
</template>
