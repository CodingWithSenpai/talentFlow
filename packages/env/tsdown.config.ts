import { execSync } from "node:child_process"
import { defineConfig } from "tsdown"

import pkg from "../../package.json" with { type: "json" }

const getGitSha = () => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim()
  } catch {
    return "unknown"
  }
}

const VERSION = pkg.version
const GIT_SHA = getGitSha()
const BUILD_VERSION = `${VERSION}-${GIT_SHA}`

const entries = [
  "src/index.ts",
  "src/api-hono.ts",
  "src/auth.ts",
  "src/db.ts",
  "src/web-next.ts",
] as const

export default entries.map((entry) =>
  defineConfig({
    entry: [entry],
    outDir: "dist",
    minify: true,
    define: {
      __VERSION__: JSON.stringify(VERSION),
      __GIT_SHA__: JSON.stringify(GIT_SHA),
      __BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
    },
  }),
)
