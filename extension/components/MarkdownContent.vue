<script setup lang="ts">
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { onBeforeUnmount, ref, watchEffect } from 'vue'

const props = defineProps<{
  content: string
}>()

marked.setOptions({
  gfm: true,
  breaks: false
})

const root = ref<HTMLElement | null>(null)

watchEffect(() => {
  const el = root.value
  if (!el) return

  const raw = marked.parse(props.content) as string
  const fragment = DOMPurify.sanitize(raw, {
    RETURN_DOM_FRAGMENT: true,
    USE_PROFILES: { html: true }
  })

  el.replaceChildren(fragment)
})

onBeforeUnmount(() => {
  root.value?.replaceChildren()
})
</script>

<template>
  <div
    ref="root"
    class="markdown"
  />
</template>
