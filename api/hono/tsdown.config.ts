import { env } from "@packages/env"
import { defineConfig } from "tsdown"

export default [
  defineConfig({
    entry: ["src/index.ts"],
    minify: true,
    hooks: {
      "build:prepare": () => {
        const safeEnv = Object.fromEntries(
          Object.entries(env).map(([key, value]) => {
            if (key.toLowerCase().includes("secret") || key.toLowerCase().includes("token")) {
              return [key, "******** REDACTED ********"]
            }
            return [key, value]
          }),
        )
        console.log("build:prepare", safeEnv)
      },
    },
  }),
]
