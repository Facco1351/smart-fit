'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface WeeklyChartProps {
  data: { day: string; calories: number }[]
  goal: number
}

export function WeeklyChart({ data, goal }: WeeklyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          formatter={(v) => [`${Math.round(Number(v ?? 0))} kcal`, 'Calorie']}
        />
        <ReferenceLine
          y={goal}
          stroke="#10b981"
          strokeDasharray="4 4"
          label={{ value: 'Obiettivo', position: 'insideTopRight', fontSize: 10, fill: '#10b981' }}
        />
        <Bar dataKey="calories" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
