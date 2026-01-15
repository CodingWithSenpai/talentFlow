import { createMiddleware } from "hono/factory"

export const metadataMiddleware = createMiddleware<{
  Variables: { requestId: string }
}>(async (c, next) => {
  const start = performance.now()
  await next()

  const contentType = c.res.headers.get("content-type")
  if (!contentType?.includes("application/json")) return

  if (c.res.body === null) return

  try {
    const cloned = c.res.clone()
    const text = await cloned.text()

    if (!text || text.trim() === "") return

    const body = JSON.parse(text)

    if (typeof body !== "object" || body === null || Array.isArray(body)) return

    const metadata = {
      requestId: c.get("requestId"),
      timestamp: new Date().toISOString(),
      method: c.req.method,
      path: c.req.path,
      duration: Math.round(performance.now() - start),
    }

    console.log(JSON.stringify(metadata, null, 2))

    c.res = new Response(
      JSON.stringify({
        ...body,
        metadata,
      }),
      c.res,
    )
  } catch {
    // Silently skip if anything fails - don't break the response
  }
})
