import type { Session } from "@packages/auth"

import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { z } from "zod"

import { authMiddleware } from "@/middlewares"

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

app.use("/*", authMiddleware)

export const v1Router = app
  .get(
    "/session",
    describeRoute({
      tags: ["v1"],
      description: "Get current session only",
      ...({
        "x-codeSamples": [
          {
            lang: "typescript",
            label: "hono/client",
            source: `const response = await apiClient.v1.session.$get()
const data = await response.json()`,
          },
        ],
      } as object),
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(sessionSchema),
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  error: z.object({
                    code: z.string().default("AUTHORIZATION_ERROR"),
                    message: z.string().default("Unauthorized"),
                  }),
                }),
              ),
            },
          },
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
      description: "Get current user only",
      ...({
        "x-codeSamples": [
          {
            lang: "typescript",
            label: "hono/client",
            source: `const response = await apiClient.v1.user.$get()
const data = await response.json()`,
          },
        ],
      } as object),
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: resolver(userSchema),
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  error: z.object({
                    code: z.string().default("AUTHORIZATION_ERROR"),
                    message: z.string().default("Unauthorized"),
                  }),
                }),
              ),
            },
          },
        },
      },
    }),
    (c) => {
      const user = c.get("user")
      return c.json(user)
    },
  )
