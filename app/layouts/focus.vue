<template>
  <div class="relative min-h-dvh bg-default">
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute left-[-15%] top-[-10%] h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div class="absolute bottom-[-10%] right-[-10%] h-72 w-72 rounded-full bg-success/10 blur-3xl" />
    </div>
    <main class="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:py-10">
      <slot />
    </main>
  </div>
</template>
