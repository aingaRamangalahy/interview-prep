import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    questions: defineCollection({
      type: 'page',
      source: 'questions/**/*.md',
      schema: z.object({
        title: z.string(),
        category: z.enum(['technical', 'non-technical']),
        subcategory: z.string(),
        difficulty: z.enum(['easy', 'medium', 'hard']),
        hint: z.string().optional(),
        tags: z.array(z.string()).default([]),
        source: z.string().optional(),
        notes: z.string().optional()
      })
    })
  }
})
