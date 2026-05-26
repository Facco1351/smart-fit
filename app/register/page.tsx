'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri')
      return
    }
    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      }
    })
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-semibold text-white">Registrazione completata!</h2>
          <p className="text-gray-400 mt-2">
            Controlla la tua email per confermare l&apos;account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-900">
            <Flame className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SmartFit</h1>
          <p className="text-gray-400 text-sm mt-1">Crea il tuo account</p>
        </div>

        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Registrati</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-gray-300">Nome</Label>
              <Input
                id="name"
                placeholder="Mario Rossi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="min. 6 caratteri"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-emerald-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-900/30 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" disabled={isPending} className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Crea account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Hai già un account?{' '}
          <Link href="/login" className="text-emerald-400 font-medium hover:text-emerald-300">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  )
}
