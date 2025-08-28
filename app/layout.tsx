import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import VentaLogo from "@/public/VentalOGO.png"
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "VENTA Company",
  description: "Modern admin panel built with Next.js",
  generator: 'v0.dev',

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
