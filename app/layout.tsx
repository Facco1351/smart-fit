import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartFit — Diario Alimentare',
  description: 'Traccia calorie e macronutrienti ogni giorno',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full dark">
      <body className="min-h-full bg-gray-900">{children}</body>
    </html>
  )
}
