import type { Session } from "@packages/auth"

import { auth } from "@packages/auth"
import { Hono } from "hono"
import { describeRoute, resolver, validator as zValidator } from "hono-openapi"
import { z } from "zod"

const app = new Hono<{
  Variables: Session
}>()

export const authRouter = app
  .get(
    "/get-session",
    describeRoute({
      tags: ["Authentication"],
      summary: "Get session, user or both",
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(
                z.union([
                  z.object({
                    session: z.object({
                      id: z.string().default("6kpGKXeJAKfB4MERWrfdyFdKd1ZB0Czo"),
                      userId: z.string().default("iO8PZYiiwR6e0o9XDtqyAmUemv1Pc8tc"),
                      token: z.string().default("Ds8MdODZSgu57rbR8hzapFlcv6IwoIgD"),
                      ipAddress: z.string().default("202.9.122.22").nullable(),
                      userAgent: z
                        .string()
                        .default(
                          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
                        )
                        .nullable(),
                      expiresAt: z.string().default("2026-01-28T13:06:25.712Z"),
                      createdAt: z.string().default("2026-01-21T13:06:25.712Z"),
                      updatedAt: z.string().default("2026-01-21T13:06:25.712Z"),
                    }),
                    user: z.object({
                      id: z.string().default("iO8PZYiiwR6e0o9XDtqyAmUemv1Pc8tc"),
                      name: z.string().default("Neeraj Dalal"),
                      email: z.string().default("nd941z@gmail.com"),
                      emailVerified: z.boolean().default(true),
                      image: z
                        .string()
                        .default("https://avatars.githubusercontent.com/u/58145505?v=4")
                        .nullable(),
                      createdAt: z.string().default("2025-12-17T14:33:40.317Z"),
                      updatedAt: z.string().default("2025-12-17T14:33:40.317Z"),
                    }),
                  }),
                  z.object({
                    session: z.object({
                      id: z.string().default("6kpGKXeJAKfB4MERWrfdyFdKd1ZB0Czo"),
                      userId: z.string().default("iO8PZYiiwR6e0o9XDtqyAmUemv1Pc8tc"),
                      token: z.string().default("Ds8MdODZSgu57rbR8hzapFlcv6IwoIgD"),
                      ipAddress: z.string().default("202.9.122.22").nullable(),
                      userAgent: z
                        .string()
                        .default(
                          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
                        )
                        .nullable(),
                      expiresAt: z.string().default("2026-01-28T13:06:25.712Z"),
                      createdAt: z.string().default("2026-01-21T13:06:25.712Z"),
                      updatedAt: z.string().default("2026-01-21T13:06:25.712Z"),
                    }),
                  }),
                  z.object({
                    user: z.object({
                      id: z.string().default("iO8PZYiiwR6e0o9XDtqyAmUemv1Pc8tc"),
                      name: z.string().default("Neeraj Dalal"),
                      email: z.string().default("nd941z@gmail.com"),
                      emailVerified: z.boolean().default(true),
                      image: z
                        .string()
                        .default("https://avatars.githubusercontent.com/u/58145505?v=4")
                        .nullable(),
                      createdAt: z.string().default("2025-12-17T14:33:40.317Z"),
                      updatedAt: z.string().default("2025-12-17T14:33:40.317Z"),
                    }),
                  }),
                  z.null(),
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
