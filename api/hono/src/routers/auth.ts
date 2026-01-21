import type { Session } from "@packages/auth"

import { auth } from "@packages/auth"
import { Hono } from "hono"
import { describeRoute, resolver, validator as zValidator } from "hono-openapi"
import { z } from "zod"

const sessionSchema = z.object({
  id: z.string().default("6kpGKXeJAKfB4MERWrfdyFdKd1ZB0Czo"),
  userId: z.string().default("iO8PZYiiwR6e0o9XDtqyAmUemv1Pc8tc"),
  token: z.string().default("Ds8MdODZSgu57rbR8hzapFlcv6IwoIgD"),
  ipAddress: z.string().default("202.9.121.21").nullable(),
  userAgent: z.string().default("Mozilla/5.0 Chrome/143.0.0.0 Safari/537.36").nullable(),
  expiresAt: z.string().default("2026-01-28T13:06:25.712Z"),
  createdAt: z.string().default("2026-01-21T13:06:25.712Z"),
  updatedAt: z.string().default("2026-01-21T13:06:25.712Z"),
})

const userSchema = z.object({
  id: z.string().default("iO8PZYiiwR6e0o9XDtqyAmUemv1Pc8tc"),
  name: z.string().default("John Doe"),
  email: z.string().default("user@example.com"),
  emailVerified: z.boolean().default(true),
  image: z.string().default("https://example.com/avatar.png").nullable(),
  createdAt: z.string().default("2025-12-17T14:33:40.317Z"),
  updatedAt: z.string().default("2025-12-17T14:33:40.317Z"),
})

const app = new Hono<{
  Variables: Session
}>()

export const authRouter = app
  .get(
    "/get-session",
    describeRoute({
      tags: ["Authentication"],
      summary: "Get session, user or both",
      ...({
        "x-codeSamples": [
          {
            lang: "typescript",
            label: "hono/client",
            source: `const response = await apiClient.auth["get-session"].$get({
  query: {
    select: "session,user",
  },
})
const data = await response.json()`,
          },
        ],
      } as object),
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(
                z.union([
                  z.object({ session: sessionSchema, user: userSchema }),
                  z.object({ session: sessionSchema }),
                  z.object({ user: userSchema }),
                  sessionSchema,
                  userSchema,
                  z.object({}),
                ]),
              ),
            },
          },
        },
      },
    }),
    zValidator(
      "query",
      z
        .object({
          select: z.string().default("session,user").optional(),
        })
        .optional(),
    ),
    async (c) => {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      })

      if (!session) return c.json(null)

      const { select } = c.req.valid("query") ?? {}

      if (!select) return c.json(session)

      const selections = select
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      if (selections.length === 1) {
        const key = selections[0]
        if (key === "session") return c.json(session.session)
        if (key === "user") return c.json(session.user)
      }

      const result: Partial<typeof session> = {}

      for (const key of selections) {
        if (key === "session") result.session = session.session
        if (key === "user") result.user = session.user
      }

      return c.json(result)
    },
  )
  .on(["GET", "POST"], "/*", (c) => auth.handler(c.req.raw))
