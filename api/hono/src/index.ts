import { isLocal } from "@packages/env"
import { env } from "@packages/env/api-hono"
import { Scalar } from "@scalar/hono-api-reference"
import { Hono } from "hono"
import { describeRoute, openAPIRouteHandler, resolver } from "hono-openapi"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { requestId } from "hono/request-id"
import { z } from "zod"

import { metadataMiddleware } from "@/middlewares"
import { authRouter, v1Router } from "@/routers"

import pkg from "../../../package.json"

const app = new Hono().basePath("/api")

app.use(logger())
app.use("*", requestId())
app.use("*", metadataMiddleware)

app.use(
  "/*",
  cors({
    origin: env.HONO_TRUSTED_ORIGINS,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
)

const routes = app
  .get(
    "/health",
    describeRoute({
      tags: ["System"],
      description: "Get the system health",
      ...({
        "x-codeSamples": [
          {
            lang: "typescript",
            label: "hono/client",
            source: `import { apiClient } from "@/lib/api/client"

const response = await apiClient.health.$get()
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
                z.object({
                  message: z.string().meta({ example: "ok" }),
                  environment: z
                    .enum(["local", "development", "test", "staging", "production"])
                    .meta({ example: env.NODE_ENV }),
                  version: z.string().meta({ example: pkg.version }),
                }),
              ),
            },
          },
        },
      },
    }),
    (c) => {
      return c.json({
        message: "ok",
        version: pkg.version,
        environment: env.NODE_ENV,
      })
    },
  )
  .route("/auth", authRouter)
  .route("/v1", v1Router)
  .notFound((c) => {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Route not found",
        },
      },
      404,
    )
  })
  .onError((error, c) => {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request payload",
            issues: error.issues,
          },
        },
        400,
      )
    }
    if (error instanceof Error) {
      return c.json(
        {
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: isLocal(env.NODE_ENV) ? error.message : "An unexpected error occurred",
          },
        },
        500,
      )
    }
    return c.json(
      {
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      },
      500,
    )
  })
  .get(
    "/openapi.json",
    openAPIRouteHandler(app, {
      documentation: {
        info: {
          version: pkg.version,
          title: "ZeroStarter",
          description: `API Reference for your ZeroStarter Instance.
- [hono/client](https://hono.dev/docs/guides/rpc#client) - Type-safe API client for frontend
- Better Auth Instance - ${env.HONO_APP_URL}/api/auth/reference`,
        },
      },
    }),
  )
  .get(
    "/docs",
    Scalar({
      pageTitle: "API Reference | ZeroStarter",
      url: "/api/openapi.json",
      defaultHttpClient: {
        targetKey: "js",
        clientKey: "hono/client",
      },
      defaultOpenAllTags: true,
    }),
  )

export type AppType = typeof routes

export default {
  port: env.HONO_PORT,
  fetch: app.fetch,
}
