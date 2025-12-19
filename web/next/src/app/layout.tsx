import type { Metadata } from "next"

import { Navbar } from "@/components/navbar/home"
import { InnerProvider, OuterProvider } from "@/app/providers"

import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "ZeroStarter - The SaaS Starter",
    template: "%s | ZeroStarter",
  },
  description:
    "A modern, type-safe, and high-performance SaaS starter template built with a monorepo architecture.",
  openGraph: {
    type: "website",
    siteName: "ZeroStarter",
  },
  twitter: {
    card: "summary_large_image",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <OuterProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-dvh antialiased">
          <InnerProvider>
            <Navbar />
            {children}
          </InnerProvider>
        </body>
      </html>
    </OuterProvider>
  )
}
