import { ImageResponse } from "next/og"

export const alt = "ZeroStarter Documentation"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 64,
        background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui",
        padding: 80,
      }}
    >
      <div
        style={{
          fontSize: 24,
          color: "#666",
          marginBottom: 20,
          fontWeight: 500,
        }}
      >
        ZeroStarter Docs
      </div>
      <div
        style={{
          fontSize: 72,
          fontWeight: "bold",
          marginBottom: 30,
          lineHeight: 1.2,
          background: "linear-gradient(90deg, #fff 0%, #a0a0a0 100%)",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        Documentation
      </div>
      <div
        style={{
          fontSize: 28,
          color: "#a0a0a0",
          lineHeight: 1.4,
          maxWidth: 900,
        }}
      >
        A modern, type-safe, and high-performance SaaS starter template
      </div>
    </div>,
    {
      ...size,
    },
  )
}
