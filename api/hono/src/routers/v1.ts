import type { Session } from "@packages/auth"

import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { z } from "zod"

import { authMiddleware } from "@/middlewares"

const sessionSchema = z.object({
  id: z.string().meta({ example: "6kpGKXeJAKfB4MERWrfdyFdKd1ZB0Czo" }),
  userId: z.string().meta({ example: "iO8PZYiiwR6e0o9XDtqyAmUemv1Pc8tc" }),
  token: z.string().meta({ example: "Ds8MdODZSgu57rbR8hzapFlcv6IwoIgD" }),
  ipAddress: z.string().meta({ example: "202.9.121.21" }).nullable(),
  userAgent: z.string().meta({ example: "Mozilla/5.0 Chrome/143.0.0.0 Safari/537.36" }).nullable(),
  expiresAt: z.string().meta({ format: "date-time", example: "2026-01-28T13:06:25.712Z" }),
  createdAt: z.string().meta({ format: "date-time", example: "2026-01-21T13:06:25.712Z" }),
  updatedAt: z.string().meta({ format: "date-time", example: "2026-01-21T13:06:25.712Z" }),
})

const userSchema = z.object({
  id: z.string().meta({ example: "iO8PZYiiwR6e0o9XDtqyAmUemv1Pc8tc" }),
  name: z.string().meta({ example: "John Doe" }),
  email: z.string().meta({ example: "user@example.com" }),
  emailVerified: z.boolean().meta({ example: true }),
  image: z.string().meta({ example: "https://example.com/avatar.png" }).nullable(),
  createdAt: z.string().meta({ format: "date-time", example: "2025-12-17T14:33:40.317Z" }),
  updatedAt: z.string().meta({ format: "date-time", example: "2025-12-17T14:33:40.317Z" }),
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
            source: `import { apiClient } from "@/lib/api/client"

const response = await apiClient.v1.session.$get()
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
                    code: z.string().meta({ example: "AUTHORIZATION_ERROR" }),
                    message: z.string().meta({ example: "Unauthorized" }),
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
            source: `import { apiClient } from "@/lib/api/client"

const response = await apiClient.v1.user.$get()
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
                    code: z.string().meta({ example: "AUTHORIZATION_ERROR" }),
                    message: z.string().meta({ example: "Unauthorized" }),
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
