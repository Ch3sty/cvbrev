/**
 * POST /api/public/cv/sidor
 *
 * Helskärmens sidor för besökarens eget CV utan konto (skissen V4b): samma
 * indata som /api/public/cv/forhandsvisning, svaret är PDF:en ur
 * nedladdningens kedja sida för sida som webp (src/lib/cv/mallar/sidbilder.ts),
 * aldrig själva filen. Inget sparas.
 *
 * Body: { cv: CVMetadata, mall: string, val?: MallVal }. 100 per adress och
 * dygn (Chrome per anrop). Svar: { sidor, bilder: string[], kvot }.
 */
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { checkIpRateLimit, getClientIp } from '@/lib/rate-limit/ip'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { tolkaVal } from '@/lib/cv/mallar/val'
import { lasId } from '@/lib/cv/mallval/val'
import { losMallId } from '@/lib/cv/mallar/alias'
import { renderaSidbilder } from '@/lib/cv/mallar/sidbilder'

export const runtime = 'nodejs'

const IP_LIMIT = 100
const SCOPE = 'cv_sidor'
const MAX_BYTE = 120_000

export async function POST(request: Request) {
  const raw = await request.text().catch(() => '')
  if (!raw || raw.length > MAX_BYTE) return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })
  let body: { cv?: unknown; mall?: unknown; val?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })
  }
  const mall = losMallId(lasId(body.mall) ?? '')
  const cv = normalizeStructuredData(body.cv)
  if (!mall || !cv) return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })
  // Utan konto finns inget foto (fotoplatsen visar initialen). En adress i
  // fältet hämtas aldrig av serverns Chrome.
  if (cv.personalInfo && !/^data:image\//.test(cv.personalInfo.profilePhotoUrl ?? '')) cv.personalInfo.profilePhotoUrl = undefined

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const rate = await checkIpRateLimit(admin, getClientIp(request), SCOPE, IP_LIMIT)
  if (!rate.allowed) return NextResponse.json({ kod: 'kvot' }, { status: 429 })

  try {
    const s = await renderaSidbilder(cv, mall, tolkaVal(body.val))
    if (!s) return NextResponse.json({ kod: 'okand_mall' }, { status: 404 })
    return NextResponse.json(s, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
  } catch (err) {
    console.error('[public/cv/sidor]', err)
    return NextResponse.json({ kod: 'fel' }, { status: 500 })
  }
}
