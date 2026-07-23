/**
 * Permanent redirect for legacy double-prefixed question URLs.
 * Old content migration produced slugs like `questions/javascript/foo`, so pages
 * lived at `/questions/questions/javascript/foo`. Preserve those inbound links.
 */
export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  const match = path.match(/^\/questions\/questions\/(.+)$/)
  if (!match) return

  return sendRedirect(event, `/questions/${match[1]}`, 301)
})
