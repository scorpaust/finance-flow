import { blogPostPath, findBlogPostBySlug } from '../../../shared/blog'

// O blog vive em /<língua>/blog. Sem língua, sem isto, o pedido caía no login:
// é o endereço que a Holo mostra para os artigos sem `url` (webhooks/holo.post.ts).
export default defineEventHandler((event) => {
  const target = findBlogPostBySlug(getRouterParam(event, 'path') || '')
  if (!target) throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  return sendRedirect(event, `${blogPostPath(target)}${getRequestURL(event).search}`, 301)
})
