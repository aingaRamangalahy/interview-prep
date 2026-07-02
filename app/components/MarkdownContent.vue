<script setup lang="ts">
import { marked } from 'marked'

const props = defineProps<{
  content: string
}>()

marked.setOptions({
  gfm: true,
  breaks: false
})

const html = computed(() => marked.parse(props.content) as string)
</script>

<template>
  <div
    class="prose prose-invert max-w-none"
    v-html="html"
  />
</template>
