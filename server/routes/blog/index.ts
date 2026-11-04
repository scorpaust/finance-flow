// O blog vive em /<língua>/blog: sem língua, sem isto, o pedido caía no login.
export default defineEventHandler((event) => sendRedirect(event, `/pt/blog${getRequestURL(event).search}`, 301))
