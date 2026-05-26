'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Save, User, Heart, Copy, Check } from 'lucide-react'
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

const IBAN = 'IT78R0366901600534898976434'

export function ProfileClient({ profile, email }: ProfileClientProps) {
  const router = useRouter()
  const [name, setName] = useState(profile.full_name ?? '')
  const [carbs, setCarbs] = useState(String(profile.daily_carbs_goal))
  const [protein, setProtein] = useState(String(profile.daily_protein_goal))
  const [fat, setFat] = useState(String(profile.daily_fat_goal))
  const [calories, setCalories] = useState(String(profile.daily_calorie_goal))
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saving, startSave] = useTransition()
  const [loggingOut, startLogout] = useTransition()

  function recalcCalories(c: string, p: string, f: string) {
    const cal = (parseFloat(c) || 0) * 4 + (parseFloat(p) || 0) * 4 + (parseFloat(f) || 0) * 9
    setCalories(String(Math.round(cal)))
  }

  function handleCarbsChange(v: string) {
    setCarbs(v)
    recalcCalories(v, protein, fat)
  }

  function handleProteinChange(v: string) {
    setProtein(v)
    recalcCalories(carbs, v, fat)
  }

  function handleFatChange(v: string) {
    setFat(v)
    recalcCalories(carbs, protein, v)
  }

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

  function handleCopyIBAN() {
    navigator.clipboard.writeText(IBAN).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 bg-emerald-900/40 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-100">{name || 'Profilo'}</h1>
          <p className="text-sm text-gray-400">{email}</p>
        </div>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm text-neutral-600 dark:text-gray-400">Informazioni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label className="dark:text-gray-300">Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Il tuo nome"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm text-neutral-600 dark:text-gray-400">Obiettivi giornalieri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-amber-600 dark:text-amber-400 text-xs">Carboidrati (g)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={carbs}
                onChange={(e) => handleCarbsChange(e.target.value)}
                min="0"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-blue-600 dark:text-blue-400 text-xs">Proteine (g)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={protein}
                onChange={(e) => handleProteinChange(e.target.value)}
                min="0"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-red-500 dark:text-red-400 text-xs">Grassi (g)</Label>
              <Input
                type="number"
                inputMode="numeric"
                value={fat}
                onChange={(e) => handleFatChange(e.target.value)}
                min="0"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-emerald-600 dark:text-emerald-400 text-xs">
              Calorie calcolate (kcal)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                min="500"
                max="6000"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              />
              <span className="text-xs text-neutral-400 dark:text-gray-500 whitespace-nowrap">C×4 + P×4 + G×9</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full h-12">
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

      <Card className="dark:bg-gray-800 dark:border-gray-700 border-pink-100 dark:border-pink-900/30">
        <CardHeader>
          <CardTitle className="text-sm text-pink-600 dark:text-pink-400 flex items-center gap-2">
            <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
            Supporta SmartFit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-neutral-500 dark:text-gray-400">
            Se SmartFit ti è utile, puoi fare una donazione libera. Grazie di cuore!
          </p>
          <div className="bg-neutral-50 dark:bg-gray-700 rounded-xl p-3 space-y-1">
            <p className="text-xs text-neutral-500 dark:text-gray-400 font-medium">Beneficiario</p>
            <p className="text-sm font-semibold text-neutral-800 dark:text-gray-100">Facchini Domenico</p>
          </div>
          <div className="bg-neutral-50 dark:bg-gray-700 rounded-xl p-3 space-y-1">
            <p className="text-xs text-neutral-500 dark:text-gray-400 font-medium">IBAN</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-mono font-semibold text-neutral-800 dark:text-gray-100 break-all">{IBAN}</p>
              <button
                onClick={handleCopyIBAN}
                className="p-2 rounded-lg bg-white dark:bg-gray-600 text-neutral-400 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleLogout}
        disabled={loggingOut}
        variant="outline"
        className="w-full h-12 text-red-500 border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
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

      <div className="h-4" />
    </div>
  )
}
