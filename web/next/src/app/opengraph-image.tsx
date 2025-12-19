import { ImageResponse } from "next/og"

export const alt = "ZeroStarter - The SaaS Starter"
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
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          fontSize: 96,
          fontWeight: "bold",
          marginBottom: 20,
          background: "linear-gradient(90deg, #fff 0%, #a0a0a0 100%)",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        ZeroStarter
      </div>
      <div
        style={{
          fontSize: 32,
          color: "#a0a0a0",
          textAlign: "center",
          maxWidth: 800,
          paddingLeft: 40,
          paddingRight: 40,
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
