import type { Session } from "@packages/auth"

import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { z } from "zod"

import { authMiddleware } from "@/middlewares"

const app = new Hono<{
  Variables: Session
}>()

app.use("/*", authMiddleware)

export const v1Router = app
  .get(
    "/session",
    describeRoute({
      tags: ["v1"],
      summary: "Get session only",
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  id: z.string().default("6kpGKXeJAKfB4MERWrfdyFdKd1ZB0Czo"),
                  userId: z.string().default("iO8PZYiiwR6e0o9XDtqyAmUemv1Pc8tc"),
                  token: z.string().default("Ds8MdODZSgu57rbR8hzapFlcv6IwoIgD"),
                  ipAddress: z.string().default("202.9.122.22").nullable(),
                  userAgent: z
                    .string()
                    .nullable()
                    .default("Mozilla/5.0 Chrome/143.0.0.0 Safari/537.36"),
                  expiresAt: z.string().default("2026-01-28T13:06:25.712Z"),
                  createdAt: z.string().default("2026-01-21T13:06:25.712Z"),
                  updatedAt: z.string().default("2026-01-21T13:06:25.712Z"),
                }),
              ),
            },
          },
        },
        401: {
          description: "Unauthorized",
        },
      },
    }),
    (c) => {
      const session = c.get("session")
      return c.json(session)
    },
  )
  .get(
    "/user",
    describeRoute({
      tags: ["v1"],
      summary: "Get user only",
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
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
              ),
            },
          },
        },
        401: {
          description: "Unauthorized",
        },
      },
    }),
    (c) => {
      const user = c.get("user")
      return c.json(user)
    },
  )
