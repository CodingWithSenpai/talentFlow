import { BUILD_VERSION } from "@packages/env"
import { env } from "@packages/env/web-next"

// Server-only env vars
const getInternalApiUrl = () => {
  if (typeof window === "undefined") {
    return env.INTERNAL_API_URL
  }
  return undefined
}

export const config = {
  // Application configuration
  app: {
    name: "TalentFlow",
    description:
      "AI hiring CRM with a landing + waitlist first, then a full candidate ranking and application tracking dashboard.",
    tagline: "AI hiring CRM",
    url: env.NEXT_PUBLIC_APP_URL,
    version: BUILD_VERSION,
  },

  // API configuration
  api: {
    url: env.NEXT_PUBLIC_API_URL,
    internalUrl: getInternalApiUrl(),
  },

  // Social links
  social: {
    github: "https://github.com/CodingWithSenpai/talentFlow",
  },

  // Feature flags
  features: {
    // example: enableAnalytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  },

  // Sidebar navigation configuration
  sidebar: {
    groups: [
      {
        label: "Getting Started",
        items: [
          {
            title: "Introduction",
            url: "/docs",
          },
          {
            title: "Architecture",
            url: "/docs/getting-started/architecture",
          },
          {
            title: "Project Structure",
            url: "/docs/getting-started/project-structure",
          },
          {
            title: "Type-Safe API Client",
            url: "/docs/getting-started/type-safe-api",
          },
          {
            title: "Installation",
            url: "/docs/getting-started/installation",
          },
          {
            title: "Scripts",
            url: "/docs/getting-started/scripts",
          },
          {
            title: "Roadmap",
            url: "/docs/getting-started/roadmap",
          },
        ],
      },
      {
        label: "Manage",
        collapsible: true,
        categories: {
          Analytics: [
            {
              title: "PostHog",
              url: "/docs/manage/analytics",
            },
          ],
          "Code Quality": [
            {
              title: "Git Hooks & Linting",
              url: "/docs/manage/code-quality",
            },
          ],
          "Content Management": [
            {
              title: "Blog",
              url: "/docs/manage/blog",
            },
            {
              title: "Documentation",
              url: "/docs/manage/documentation",
            },
            {
              title: "Feedback",
              url: "/docs/manage/feedback",
            },
          ],
          "Environment & Release": [
            {
              title: "Environment",
              url: "/docs/manage/environment",
            },
            {
              title: "Release",
              url: "/docs/manage/release",
            },
          ],
          "Indexing and AI/LLM": [
            {
              title: "llms.txt",
              url: "/docs/manage/llms-txt",
            },
            {
              title: "robots.txt",
              url: "/docs/manage/robots",
            },
            {
              title: "Sitemap",
              url: "/docs/manage/sitemap",
            },
          ],
        },
      },
      {
        label: "Deployment",
        items: [
          {
            title: "Docker",
            url: "/docs/deployment/docker",
          },
          {
            title: "Vercel",
            url: "/docs/deployment/vercel",
          },
        ],
      },
      {
        label: "Resources",
        items: [
          {
            title: "AI Skills",
            url: "/docs/resources/ai-skills",
          },
          {
            title: "IDE Setup",
            url: "/docs/resources/ide-setup",
          },
          {
            title: "Infisical",
            url: "/docs/resources/infisical",
          },
        ],
      },
      {
        label: "MIT",
        items: [
          {
            title: "Contributing",
            url: "/docs/contributing",
          },
        ],
      },
    ],
  },
} as const

export type Config = typeof config
