import type { Difficulty, Subcategory } from '~/types'
import { formatDifficulty, formatSubcategory } from '~/utils/categories'

const SITE_NAME = 'javascriptinterview.dev'
const DEFAULT_DESCRIPTION = 'Daily JavaScript, TypeScript, and Vue interview practice with spaced repetition — hundreds of interview questions with detailed answers.'

function stripMarkdown(value: string, maxLength = 160): string {
  const cleaned = value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[#>*_~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length <= maxLength) return cleaned
  return `${cleaned.slice(0, maxLength - 1).trimEnd()}…`
}

export function useSiteSeo(options: {
  title: string
  description?: string
  path?: string
  noindex?: boolean
  og?: {
    title?: string
    description?: string
    eyebrow?: string
  }
}) {
  const route = useRoute()
  const siteConfig = useSiteConfig()
  const path = options.path ?? route.path
  const absoluteUrl = computed(() => `${siteConfig.url}${path === '/' ? '' : path}`)
  const description = options.description || DEFAULT_DESCRIPTION
  const ogTitle = options.og?.title || options.title
  const ogDescription = options.og?.description || description

  // nuxt-seo-utils appends `%separator %siteName` — pass the bare page title.
  useSeoMeta({
    title: options.title,
    description,
    ogTitle,
    ogDescription,
    ogType: 'website',
    ogUrl: absoluteUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: ogTitle,
    twitterDescription: ogDescription,
    robots: options.noindex ? 'noindex, nofollow' : 'index, follow'
  })

  useHead({
    link: [{ rel: 'canonical', href: absoluteUrl }]
  })

  defineOgImage('Default', {
    title: ogTitle,
    description: ogDescription,
    eyebrow: options.og?.eyebrow || SITE_NAME
  })
}

export function useQuestionSeo(question: MaybeRefOrGetter<{
  title: string
  answer?: string
  hint?: string
  subcategory: Subcategory
  difficulty: Difficulty
  id: string
} | null | undefined>) {
  const siteConfig = useSiteConfig()
  const q = computed(() => toValue(question))

  const description = computed(() => {
    const value = q.value
    if (!value) return 'This interview question could not be found.'
    const topic = formatSubcategory(value.subcategory)
    const difficulty = formatDifficulty(value.difficulty)
    return stripMarkdown(
      value.hint
        || value.answer
        || `${topic} interview question (${difficulty}) with a detailed ideal answer.`
    )
  })

  const title = computed(() => q.value?.title || 'Question not found')
  const absoluteUrl = computed(() =>
    q.value ? `${siteConfig.url}/questions/${q.value.id}` : `${siteConfig.url}/questions`
  )
  const eyebrow = computed(() => {
    if (!q.value) return SITE_NAME
    return `${formatSubcategory(q.value.subcategory)} · ${formatDifficulty(q.value.difficulty)}`
  })

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'article',
    ogUrl: absoluteUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    robots: () => (q.value ? 'index, follow' : 'noindex, nofollow')
  })

  useHead({
    link: [{ rel: 'canonical', href: absoluteUrl }]
  })

  defineOgImage('Default', {
    title,
    description,
    eyebrow
  })

  useSchemaOrg(() => {
    if (!q.value) return []

    return [
      defineWebPage({
        '@type': 'FAQPage',
        name: q.value.title,
        description: description.value
      }),
      defineQuestion({
        name: q.value.title,
        acceptedAnswer: stripMarkdown(q.value.answer || description.value, 5000)
      })
    ]
  })
}
