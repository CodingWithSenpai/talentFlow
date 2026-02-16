import { findIp } from "@arcjet/ip"
import { db, waitlist } from "@packages/db"
import { env } from "@packages/env/api-hono"
import { randomUUIDv7 } from "bun"
import { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import { z } from "zod"

// Optional: welcome email via Resend
async function sendWelcomeEmail(email: string) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) return

  const { Resend } = await import("resend")
  const resend = new Resend(env.RESEND_API_KEY)

  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject: "Welcome to TalentFlow",
    text: "You’re on the TalentFlow waitlist. We’ll reach out when we launch.",
  })
}

const waitlistRequestSchema = z.object({
  email: z.string().email(),
  // simple bot trap (optional on client)
  company: z.string().optional(),
})

export const waitlistRouter = new Hono().post(
  "/",
  describeRoute({
    tags: ["Waitlist"],
    description: "Join the TalentFlow waitlist",
    requestBody: {
      content: {
        "application/json": {
          schema: resolver(waitlistRequestSchema),
        },
      },
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": {
            schema: resolver(z.object({ data: z.object({ ok: z.boolean() }) })),
          },
        },
      },
      400: {
        description: "Bad Request",
        content: {
          "application/json": {
            schema: resolver(
              z.object({ error: z.object({ code: z.string(), message: z.string() }) }),
            ),
          },
        },
      },
    },
  }),
  async (c) => {
    const body = await c.req.json().catch(() => null)
    const parsed = waitlistRequestSchema.safeParse(body)

    if (!parsed.success) {
      return c.json({ error: { code: "BAD_REQUEST", message: "Invalid payload" } }, 400)
    }

    // Honeypot: if filled, silently accept.
    if (parsed.data.company && parsed.data.company.trim().length > 0) {
      return c.json({ data: { ok: true } })
    }

    const ip = findIp(c.req.raw) || undefined

    await db
      .insert(waitlist)
      .values({
        id: randomUUIDv7(),
        email: parsed.data.email.toLowerCase(),
        ip,
      })
      .onConflictDoNothing()

    // best-effort email
    sendWelcomeEmail(parsed.data.email).catch(() => {})

    return c.json({ data: { ok: true } })
  },
)
