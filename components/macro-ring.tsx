interface MacroRingProps {
  label: string
  value: number
  goal: number
  color: string
  unit?: string
}

export function MacroRing({ label, value, goal, color, unit = 'g' }: MacroRingProps) {
  const pct = Math.min((value / goal) * 100, 100)
  const r = 28
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (pct / 100) * circumference
  const remaining = Math.max(0, goal - value)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-neutral-100 dark:text-gray-700" />
          <circle
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-neutral-800 dark:text-gray-100">{Math.round(value)}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-neutral-500 dark:text-gray-400">{label}</p>
        <p className="text-xs text-neutral-400 dark:text-gray-500">{Math.round(remaining)}{unit} rimasti</p>
      </div>
    </div>
  )
}
