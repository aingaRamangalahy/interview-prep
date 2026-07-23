<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  eyebrow?: string
}>(), {
  title: 'javascriptinterview.dev',
  description: 'Daily interview practice with spaced repetition.',
  eyebrow: 'Interview Prep'
})
</script>

<template>
  <div
    style="display:flex;height:100%;width:100%;flex-direction:column;justify-content:space-between;background-color:#0a0a0a;color:#ffffff;padding:64px;"
  >
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="display:flex;width:48px;height:48px;align-items:center;justify-content:center;border-radius:12px;background-color:#ffffff;color:#000000;font-size:22px;font-weight:700;">
        JS
      </div>
      <div style="font-size:24px;font-weight:500;color:rgba(255,255,255,0.7);">
        javascriptinterview.dev
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:20px;">
      <div
        v-if="eyebrow"
        style="font-size:20px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.45);"
      >
        {{ eyebrow }}
      </div>
      <div style="max-width:980px;font-size:56px;font-weight:600;line-height:1.08;color:#ffffff;">
        {{ title }}
      </div>
      <div
        v-if="description"
        style="max-width:900px;font-size:24px;line-height:1.35;color:rgba(255,255,255,0.6);"
      >
        {{ description }}
      </div>
    </div>
  </div>
</template>
