'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { Loader2, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface WeightEntry {
  weight_kg: number
  logged_at: string
}

export function WeightTracker() {
  const [logs, setLogs] = useState<WeightEntry[]>([])
  const [input, setInput] = useState('')
  const [saving, startSave] = useTransition()

  const loadLogs = useCallback(async () => {
    const res = await fetch('/api/weight')
    if (res.ok) {
      const data = await res.json()
      setLogs(data)
    }
  }, [])

  useEffect(() => { loadLogs() }, [loadLogs])

  function handleSave() {
    if (!input || parseFloat(input) <= 0) return
    startSave(async () => {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_kg: parseFloat(input) }),
      })
      if (res.ok) {
        setInput('')
        await loadLogs()
      }
    })
  }

  const last = logs.at(-1)
  const prev = logs.at(-2)
  const delta = last && prev ? last.weight_kg - prev.weight_kg : null

  const chartData = logs.map((e) => ({
    day: new Date(e.logged_at + 'T12:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }),
    peso: e.weight_kg,
  }))

  const allWeights = logs.map((e) => e.weight_kg)
  const minW = allWeights.length ? Math.floor(Math.min(...allWeights)) - 1 : 0
  const maxW = allWeights.length ? Math.ceil(Math.max(...allWeights)) + 1 : 100

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-sm text-neutral-600 dark:text-gray-400 flex items-center justify-between">
          <span>⚖️ Peso corporeo</span>
          {last && (
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-neutral-800 dark:text-gray-100">{last.weight_kg} kg</span>
              {delta !== null && (
                <span className={`flex items-center text-xs font-medium ${
                  delta < 0 ? 'text-emerald-500' : delta > 0 ? 'text-red-400' : 'text-neutral-400'
                }`}>
                  {delta < 0
                    ? <TrendingDown className="h-3 w-3 mr-0.5" />
                    : delta > 0
                    ? <TrendingUp className="h-3 w-3 mr-0.5" />
                    : <Minus className="h-3 w-3 mr-0.5" />}
                  {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                </span>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {chartData.length > 1 && (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minW, maxW]}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', fontSize: 12 }}
                formatter={(v) => [`${v} kg`, 'Peso']}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#10b981"
                strokeWidth={2}
                dot={<Dot r={3} fill="#10b981" />}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {chartData.length === 0 && (
          <p className="text-xs text-neutral-400 dark:text-gray-500 text-center py-2">
            Nessuna registrazione. Inizia oggi!
          </p>
        )}

        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="kg (es. 74.5)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            min="20"
            max="300"
            step="0.1"
            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
          <Button onClick={handleSave} disabled={saving || !input} className="shrink-0 px-4">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salva'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
