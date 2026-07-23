import { getDb } from '../../utils/db'
import type { QuestionDocument } from '../../utils/questions'

export default defineSitemapEventHandler(async () => {
  const database = await getDb()
  const docs = await database
    .collection<QuestionDocument>('questions')
    .find(
      { status: { $ne: 'archived' } },
      { projection: { slug: 1, updatedAt: 1 } }
    )
    .toArray()

  const questionUrls = docs.map(doc => ({
    loc: `/questions/${doc.slug}`,
    lastmod: doc.updatedAt,
    changefreq: 'monthly' as const,
    priority: 0.8 as const
  }))

  return [
    { loc: '/', changefreq: 'weekly' as const, priority: 1 as const },
    { loc: '/questions', changefreq: 'daily' as const, priority: 0.9 as const },
    { loc: '/practice', changefreq: 'weekly' as const, priority: 0.7 as const },
    ...questionUrls
  ]
})
