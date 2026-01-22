import { auth } from "@packages/auth"
import { Hono } from "hono"

const app = new Hono()

export const authRouter = app
  .get("/get-session", (c) => auth.handler(c.req.raw))
  .on(["GET", "POST"], "/*", (c) => auth.handler(c.req.raw))
