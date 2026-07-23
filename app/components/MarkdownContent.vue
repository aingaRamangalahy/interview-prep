<script setup lang="ts">
import type { Tokens } from 'marked'
import { marked, Renderer } from 'marked'

const props = defineProps<{
  content: string
}>()

const SHIKI_THEME = 'github-dark-default'
const SHIKI_LANGS = ['javascript', 'typescript', 'jsx', 'tsx', 'vue', 'html', 'css', 'json', 'bash', 'python', 'sql', 'yaml', 'markdown'] as const

const LANG_ALIASES: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  py: 'python',
  yml: 'yaml',
  md: 'markdown'
}

const LANG_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  vue: 'Vue',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  bash: 'Shell',
  python: 'Python',
  sql: 'SQL',
  yaml: 'YAML',
  markdown: 'Markdown',
  text: 'Text'
}

function resolveLangKey(raw?: string): string {
  const key = (raw || '').trim().toLowerCase().split(/\s+/)[0] || ''
  if (!key) return 'text'
  return LANG_ALIASES[key] ?? key
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

class AppRenderer extends Renderer {
  override code({ text, lang }: Tokens.Code): string {
    const langKey = resolveLangKey(lang)
    const label = LANG_LABELS[langKey] || langKey

    return `<div class="md-code">
      <div class="md-code__header">
        <span class="md-code__label">${escapeHtml(label)}</span>
        <button type="button" class="md-code__copy" data-copy-code aria-label="Copy code">
          <svg class="md-code__icon md-code__icon--copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <svg class="md-code__icon md-code__icon--check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" hidden><path d="M20 6 9 17l-5-5"/></svg>
        </button>
      </div>
      <pre class="md-code__pre"><code class="md-code__code" data-shiki-lang="${langKey}">${escapeHtml(text)}</code></pre>
    </div>`
  }

  override table(token: Tokens.Table): string {
    return `<div class="md-table-wrapper">${super.table(token)}</div>`
  }
}

const renderer = new AppRenderer()

const html = computed(() => marked.parse(props.content, { renderer, gfm: true, breaks: false }) as string)

async function loadHighlighter() {
  const { createHighlighter, createJavaScriptRegexEngine } = await import('shiki')
  return createHighlighter({
    themes: [SHIKI_THEME],
    langs: [...SHIKI_LANGS],
    engine: createJavaScriptRegexEngine()
  })
}

let highlighterPromise: ReturnType<typeof loadHighlighter> | null = null

function getHighlighter() {
  if (!highlighterPromise) highlighterPromise = loadHighlighter()
  return highlighterPromise
}

function extractShikiInner(shikiHtml: string): string {
  const match = shikiHtml.match(/<code[^>]*>([\s\S]*)<\/code>\s*<\/pre>\s*$/)
  return match?.[1] ?? shikiHtml
}

const container = ref<HTMLElement | null>(null)

async function enhanceCodeBlocks() {
  if (!import.meta.client || !container.value) return

  const blocks = container.value.querySelectorAll<HTMLElement>('code[data-shiki-lang]:not([data-shiki-done])')
  if (blocks.length === 0) return

  const highlighter = await getHighlighter().catch(() => null)

  for (const block of blocks) {
    block.dataset.shikiDone = 'true'
    if (!highlighter) continue

    const lang = block.dataset.shikiLang || 'text'
    const code = block.textContent ?? ''

    try {
      const highlighted = highlighter.codeToHtml(code, { lang, theme: SHIKI_THEME })
      block.innerHTML = extractShikiInner(highlighted)
    } catch {
      // Unsupported/unknown language — leave the plain escaped code as-is.
    }
  }
}

watch(html, () => nextTick(enhanceCodeBlocks))
onMounted(enhanceCodeBlocks)

function handleContainerClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  const button = target.closest('[data-copy-code]') as HTMLButtonElement | null
  if (!button) return

  const codeEl = button.closest('.md-code')?.querySelector('code')
  const text = codeEl?.textContent ?? ''
  if (!text) return

  navigator.clipboard.writeText(text).then(() => {
    button.classList.add('is-copied')
    window.setTimeout(() => button.classList.remove('is-copied'), 1500)
  }).catch(() => {})
}
</script>

<template>
  <div
    ref="container"
    class="md prose dark:prose-invert max-w-none"
    @click="handleContainerClick"
    v-html="html"
  />
</template>

<style scoped>
.md :deep(pre code::before),
.md :deep(pre code::after) {
  content: none;
}

.md :deep(.md-code) {
  margin: 1.25em 0;
  overflow: hidden;
  border-radius: 0.75rem;
  border: 1px solid #30363d;
  background-color: #0d1117;
}

.md :deep(.md-code__header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #30363d;
  background-color: #161b22;
}

.md :deep(.md-code__label) {
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #8b949e;
}

.md :deep(.md-code__copy) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  padding: 0.3rem;
  color: #8b949e;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.md :deep(.md-code__copy:hover) {
  color: #e6edf3;
  background-color: #21262d;
}

.md :deep(.md-code__icon) {
  width: 0.9rem;
  height: 0.9rem;
}

.md :deep(.md-code__copy.is-copied .md-code__icon--copy) {
  display: none;
}

.md :deep(.md-code__copy:not(.is-copied) .md-code__icon--check) {
  display: none;
}

.md :deep(.md-code__copy.is-copied) {
  color: #3fb950;
}

.md :deep(.md-code__pre) {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
  background-color: transparent;
}

.md :deep(.md-code__code) {
  font-family: var(--font-mono, ui-monospace, 'SF Mono', Menlo, monospace);
  font-size: 0.85rem;
  line-height: 1.6;
  color: #e6edf3;
  background: transparent;
  white-space: pre;
}

.md :deep(.md-code__pre .shiki) {
  margin: 0;
  padding: 0;
  background-color: transparent !important;
}

.md :deep(.md-table-wrapper) {
  margin: 1.25em 0;
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid var(--ui-border, #30363d);
}

.md :deep(.md-table-wrapper table) {
  margin: 0;
  width: 100%;
}

.md :deep(.md-table-wrapper th) {
  white-space: nowrap;
}
</style>
