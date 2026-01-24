import { auth } from "@packages/auth"
import { Hono } from "hono"

const app = new Hono()

export const authRouter = app
  .get("/get-session", async (c) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    })

    if (!session) {
      return c.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          },
        },
        401,
      )
    }

    return c.json(session)
  })
  .on(["GET", "POST"], "/*", (c) => auth.handler(c.req.raw))
