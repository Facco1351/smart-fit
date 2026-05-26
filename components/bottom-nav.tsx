'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/diary', label: 'Diario', icon: BookOpen },
  { href: '/profile', label: 'Profilo', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-neutral-100 dark:border-gray-800 z-40 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-colors min-w-[64px]',
                active
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-neutral-400 dark:text-gray-500 hover:text-neutral-600 dark:hover:text-gray-300'
              )}
            >
              <Icon className={cn('h-6 w-6', active && 'stroke-[2.5]')} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
