import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'

export const metadata: Metadata = {
  title: 'SmartFit — Diario Alimentare',
  description: 'Traccia calorie e macronutrienti ogni giorno',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full" suppressHydrationWarning>
      <body className="min-h-full dark:bg-gray-900">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
