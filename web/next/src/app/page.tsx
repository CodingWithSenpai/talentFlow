import Link from "next/link"

import { Button } from "@/components/ui/button"
import { config } from "@/lib/config"

import { WaitlistForm } from "./waitlist-form"

export default function Home() {
  return (
    <main className="from-background via-background to-muted/20 min-h-screen bg-linear-to-b">
      <div className="container mx-auto max-w-5xl px-5 py-16">
        <header className="flex items-center justify-between">
          <div className="text-lg font-semibold">TalentFlow</div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/docs" />}>
              Docs
            </Button>
          </div>
        </header>

        <section className="mt-16">
          <p className="text-muted-foreground mb-4 text-sm">AI hiring CRM (coming soon)</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Hire the best, faster.</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
            TalentFlow helps you turn inbound applications into a ranked shortlist with an AI score
            (0–100), confidence, and a clean hiring workflow.
          </p>

          <div className="mt-8">
            <WaitlistForm />
            <p className="text-muted-foreground mt-3 text-xs">
              Real emails only. No spam. By joining, you agree to be contacted about the launch.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="bg-background/60 rounded-xl border p-5">
              <div className="font-medium">AI screening</div>
              <div className="text-muted-foreground mt-1 text-sm">
                Resume + GitHub context → summary, pros/cons, score.
              </div>
            </div>
            <div className="bg-background/60 rounded-xl border p-5">
              <div className="font-medium">Smart ranking</div>
              <div className="text-muted-foreground mt-1 text-sm">
                Sort candidates by score and filter by confidence.
              </div>
            </div>
            <div className="bg-background/60 rounded-xl border p-5">
              <div className="font-medium">Hiring workflow</div>
              <div className="text-muted-foreground mt-1 text-sm">
                Kanban stages, notes, tags, and a team-ready dashboard.
              </div>
            </div>
          </div>

          <footer className="text-muted-foreground mt-16 flex flex-col gap-2 text-xs">
            <div>
              API: <span className="font-mono">{config.api.url}</span>
            </div>
            <div>
              Repo:{" "}
              <a className="underline" href={config.social.github}>
                GitHub
              </a>
            </div>
          </footer>
        </section>
      </div>
    </main>
  )
}
