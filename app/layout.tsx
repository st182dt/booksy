import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BookMarket - Used School Books Marketplace",
  description: "Buy and sell used school books with ease",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
          <Navigation />
          <main className="container mx-auto px-4 py-8">{children}</main>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
