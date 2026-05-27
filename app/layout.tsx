import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartFit — Diario Alimentare',
  description: 'Traccia calorie e macronutrienti ogni giorno',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full dark">
      <body className="min-h-full bg-gray-900">{children}</body>
    </html>
  )
}
