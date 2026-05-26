'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, TrendingUp, BookOpen } from 'lucide-react'
import { CalorieSummary } from '@/components/calorie-summary'
import { MacroRing } from '@/components/macro-ring'
import { WeeklyChart } from '@/components/weekly-chart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { calcDayTotals } from '@/lib/utils'
import type { DiaryEntry, Profile } from '@/types'

interface DashboardClientProps {
  profile: Profile
  initialEntries: DiaryEntry[]
  today: string
}

export function DashboardClient({ profile, initialEntries, today }: DashboardClientProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [weeklyData, setWeeklyData] = useState<{ day: string; calories: number }[]>([])

  const totals = calcDayTotals(entries)

  const loadWeekly = useCallback(async () => {
    const res = await fetch(`/api/diary/weekly?end=${today}`)
    const data = await res.json()
    setWeeklyData(data)
  }, [today])

  useEffect(() => {
    loadWeekly()
  }, [loadWeekly])

  const dayName = new Date(today + 'T12:00:00').toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 capitalize">{dayName}</h1>
          <p className="text-sm text-neutral-500">Ciao, {profile.full_name?.split(' ')[0] ?? 'atleta'} 👋</p>
        </div>
        <Link
          href="/diary"
          className="flex items-center gap-1 text-sm text-emerald-600 font-medium hover:text-emerald-700"
        >
          Diario <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <CalorieSummary totals={totals} profile={profile} />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-neutral-600 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Macronutrienti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around">
            <MacroRing
              label="Proteine"
              value={totals.protein}
              goal={profile.daily_protein_goal}
              color="#3b82f6"
            />
            <MacroRing
              label="Carboidrati"
              value={totals.carbs}
              goal={profile.daily_carbs_goal}
              color="#f59e0b"
            />
            <MacroRing
              label="Grassi"
              value={totals.fat}
              goal={profile.daily_fat_goal}
              color="#ef4444"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-neutral-600 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-500" />
              Ultimi 7 giorni
            </CardTitle>
            <span className="text-xs text-neutral-400">Obiettivo: {profile.daily_calorie_goal} kcal</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <WeeklyChart data={weeklyData} goal={profile.daily_calorie_goal} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs text-neutral-500 font-medium">Calorie bruciate</p>
          <p className="text-2xl font-bold text-neutral-800 mt-1">—</p>
          <p className="text-xs text-neutral-400">Funzione in arrivo</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-neutral-500 font-medium">Streak</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">🔥 —</p>
          <p className="text-xs text-neutral-400">Giorni consecutivi</p>
        </Card>
      </div>
    </div>
  )
}
