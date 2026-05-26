'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Save, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Profile } from '@/types'

interface ProfileClientProps {
  profile: Profile
  email: string
}

export function ProfileClient({ profile, email }: ProfileClientProps) {
  const router = useRouter()
  const [name, setName] = useState(profile.full_name ?? '')
  const [calories, setCalories] = useState(String(profile.daily_calorie_goal))
  const [protein, setProtein] = useState(String(profile.daily_protein_goal))
  const [carbs, setCarbs] = useState(String(profile.daily_carbs_goal))
  const [fat, setFat] = useState(String(profile.daily_fat_goal))
  const [saved, setSaved] = useState(false)
  const [saving, startSave] = useTransition()
  const [loggingOut, startLogout] = useTransition()

  function handleSave() {
    startSave(async () => {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          daily_calorie_goal: parseInt(calories) || 2000,
          daily_protein_goal: parseInt(protein) || 150,
          daily_carbs_goal: parseInt(carbs) || 250,
          daily_fat_goal: parseInt(fat) || 65,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    })
  }

  function handleLogout() {
    startLogout(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    })
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-neutral-800">{name || 'Profilo'}</h1>
          <p className="text-sm text-neutral-500">{email}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-neutral-600">Informazioni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Il tuo nome" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-neutral-600">Obiettivi giornalieri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Calorie (kcal)</Label>
            <Input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              min="500"
              max="6000"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-blue-600">Proteine (g)</Label>
              <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} min="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-amber-600">Carboidrati (g)</Label>
              <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} min="0" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-red-500">Grassi (g)</Label>
              <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} min="0" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : saved ? (
          '✅ Salvato!'
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salva modifiche
          </>
        )}
      </Button>

      <Button
        onClick={handleLogout}
        disabled={loggingOut}
        variant="outline"
        className="w-full text-red-500 border-red-200 hover:bg-red-50"
      >
        {loggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-2" />
            Esci
          </>
        )}
      </Button>
    </div>
  )
}
