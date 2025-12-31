export function sortByMeta<T extends { url: string }>(
  pages: T[],
  order: string[],
  baseUrl: string,
): T[] {
  const getSlug = (url: string) => url.replace(baseUrl, "").replace(/^\//, "") || "index"
  return [...pages].sort((a, b) => {
    if (order.indexOf(getSlug(a.url)) === -1) return 1
    if (order.indexOf(getSlug(b.url)) === -1) return -1
    return order.indexOf(getSlug(a.url)) - order.indexOf(getSlug(b.url))
  })
}
