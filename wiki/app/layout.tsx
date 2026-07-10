import type { Metadata } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"

import "./globals.css"

const heading = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-heading", weight: ["500", "600", "700"] })
const body = Manrope({ subsets: ["latin"], variable: "--font-body" })

export const metadata: Metadata = {
  title: "A Wiki of Ice & Fire",
  description: "A private, source-backed archive of characters, dragons, and houses.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${heading.variable} ${body.variable}`}><body>{children}</body></html>
}
