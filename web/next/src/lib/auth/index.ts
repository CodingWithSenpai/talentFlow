import type { Session } from "@packages/auth"

import { headers } from "next/headers"

import { apiClient } from "@/lib/api/client"

export const auth = {
  api: {
    getSession: async (): Promise<Session | null> => {
      const response = await apiClient.auth["get-session"].$get(undefined, {
        headers: Object.fromEntries((await headers()).entries()),
      })

      if (!response.ok) {
        return null
      }

      return response.json() as unknown as Session
    },
  },
}
