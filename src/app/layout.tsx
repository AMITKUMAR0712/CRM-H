import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

const outfit = Outfit({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "SOHO PG | Premium PG Accommodation in Noida",
    template: "%s | SOHO PG",
  },
  description: "Find your perfect paying guest accommodation in Noida. Premium PG rooms with AC, WiFi, meals & 24/7 security in Sector 50, 51, 52, 62 & 76.",
  keywords: ["PG in Noida", "paying guest Noida", "PG near me", "best PG Noida", "PG accommodation"],
  authors: [{ name: "SOHO PG" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SOHO PG",
    title: "SOHO PG | Premium PG Accommodation in Noida",
    description: "Find your perfect paying guest accommodation in Noida. Premium PG rooms with AC, WiFi, meals & 24/7 security.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOHO PG | Premium PG Accommodation in Noida",
    description: "Find your perfect paying guest accommodation in Noida.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="antialiased">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
