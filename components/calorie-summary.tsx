import { MacroRing } from './macro-ring'
import type { DayTotals, Profile } from '@/types'

interface CalorieSummaryProps {
  totals: DayTotals
  profile: Profile
}

export function CalorieSummary({ totals, profile }: CalorieSummaryProps) {
  const calPct = Math.min((totals.calories / profile.daily_calorie_goal) * 100, 100)
  const calRemaining = Math.max(0, profile.daily_calorie_goal - totals.calories)
  const isOver = totals.calories > profile.daily_calorie_goal

  return (
    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-emerald-100 text-sm font-medium">Calorie oggi</p>
          <p className="text-4xl font-bold">{Math.round(totals.calories)}</p>
          <p className="text-emerald-200 text-sm mt-0.5">
            {isOver
              ? `+${Math.round(totals.calories - profile.daily_calorie_goal)} oltre l'obiettivo`
              : `${Math.round(calRemaining)} kcal rimanenti`}
          </p>
        </div>
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="7" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="white"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - calPct / 100)}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{Math.round(calPct)}%</span>
          </div>
        </div>
      </div>

      <div className="flex justify-around pt-3 border-t border-white/20">
        <MacroMini label="Carboidrati" value={totals.carbs} goal={profile.daily_carbs_goal} color="#fbbf24" />
        <MacroMini label="Proteine" value={totals.protein} goal={profile.daily_protein_goal} color="#6ee7b7" />
        <MacroMini label="Grassi" value={totals.fat} goal={profile.daily_fat_goal} color="#f87171" />
      </div>
    </div>
  )
}

function MacroMini({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  return (
    <div className="text-center">
      <p className="text-white font-semibold text-sm">{Math.round(value)}g</p>
      <p className="text-emerald-200 text-xs">{label}</p>
      <div className="w-16 h-1.5 bg-white/20 rounded-full mt-1">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min((value / goal) * 100, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}
