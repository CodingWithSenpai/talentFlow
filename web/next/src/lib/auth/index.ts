import type { Session } from "@packages/auth"

import { headers } from "next/headers"

import { apiClient } from "@/lib/api/client"

export const auth = {
  api: {
    getSession: async (): Promise<Session | null> => {
      try {
        const response = await apiClient.auth["get-session"].$get(undefined, {
          headers: Object.fromEntries((await headers()).entries()),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[auth.getSession] Response not ok:", response.status, errorText)
          return null
        }

        return response.json() as Promise<Session | null>
      } catch (error) {
        console.error("[auth.getSession] Error:", error)
        return null
      }
    },
  },
}
