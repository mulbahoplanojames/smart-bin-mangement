import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "SmartWaste | Intelligent Waste Management Dashboard",
  description: "Monitor real-time fill levels, optimize collection routes, and manage your IoT-connected bin fleet.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#07080a] text-white antialiased font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
