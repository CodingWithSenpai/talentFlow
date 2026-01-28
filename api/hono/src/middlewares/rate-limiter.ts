import { findIp } from "@arcjet/ip"
import { rateLimiter } from "hono-rate-limiter"

export const rateLimiterMiddleware = rateLimiter({
  // TODO: add redis or some memory store to store the rate limit data
  limit: 1,
  windowMs: 1000 * 60 * 1,
  keyGenerator: (c) => {
    const clientIp = findIp(c.req.raw)
    const userAgent = c.req.header("user-agent")
    return `${clientIp}:${userAgent?.replaceAll(" ", "_")}`
  },
  handler: (c) => {
    return c.json(
      {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
      },
      429,
    )
  },
})
