import { NextRequest, NextResponse } from 'next/server'
import { lookupByBarcode } from '@/lib/openfoodfacts'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'missing code' }, { status: 400 })

  const food = await lookupByBarcode(code)
  if (!food) return NextResponse.json({ error: 'not found' }, { status: 404 })

  return NextResponse.json(food)
}
