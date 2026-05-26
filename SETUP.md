# SmartFit Setup

## 1. Supabase

1. Crea progetto su [supabase.com](https://supabase.com)
2. Vai su **SQL Editor** → esegui `supabase/migrations/001_initial.sql`
3. Copia **Project URL** e **anon public key** da Settings → API

## 2. Variabili ambiente

```bash
cp .env.local.example .env.local
```

Compila `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 3. Deploy Vercel

```bash
npx vercel
```

Oppure connetti il repo su [vercel.com](https://vercel.com) e aggiungi le env vars nel pannello.

## 4. Supabase Auth — Email Redirect URL

In Supabase → Authentication → URL Configuration:
- **Site URL**: `https://tuo-dominio.vercel.app`
- **Redirect URLs**: `https://tuo-dominio.vercel.app/**`

## Sviluppo locale

```bash
npm run dev
```
