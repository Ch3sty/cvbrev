/**
 * GET /api/public/exempel/cv/sidor?<samma frågesträng som exempel-API:t>
 *
 * Helskärmens sidor för exempel-CV:t (skissen V4b): PDF:en ur nedladdningens
 * kedja, sida för sida som webp (src/lib/cv/mallar/sidbilder.ts). Svaret är
 * detsamma för alla besökare och cachas ett dygn i CDN:et.
 *
 * Svar: { sidor, bilder: string[], kvot }.
 */
import { NextResponse } from 'next/server'
import { renderaSidbilder } from '@/lib/cv/mallar/sidbilder'
import { exempelUrAdress } from '../exempel-cv'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const e = exempelUrAdress(new URL(request.url).searchParams)
  if (!e.ok) return NextResponse.json({ kod: 'okand' }, { status: e.status })
  try {
    const s = await renderaSidbilder(e.cv, e.mall, e.val)
    if (!s) return NextResponse.json({ kod: 'okand_mall' }, { status: 404 })
    return NextResponse.json(s, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch (err) {
    console.error('[exempel/cv/sidor]', err)
    return NextResponse.json({ kod: 'fel' }, { status: 500 })
  }
}
