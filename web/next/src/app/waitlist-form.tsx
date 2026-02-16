"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { config } from "@/lib/config"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${config.api.url}/api/waitlist`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        setError("Something went wrong. Try again.")
        return
      }

      setDone(true)
    } catch {
      setError("Network error. Try again.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-background/60 rounded-lg border p-4 text-sm">
        <div className="font-medium">You’re on the list.</div>
        <div className="text-muted-foreground mt-1">We’ll email you when TalentFlow is ready.</div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <Input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error ? <p className="text-destructive mt-2 text-xs">{error}</p> : null}
      </div>
      <Button type="submit" disabled={loading} className="sm:w-auto">
        {loading ? "Joining…" : "Join waitlist"}
      </Button>
    </form>
  )
}
