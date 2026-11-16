/**
 * POST /api/public/cv/forhandsvisning
 *
 * Besökarens eget CV (CVMetadata ur utkastet) i en mall, som HTML för
 * dokumentets iframe på provsidan och mallsidan (plan-mallar 3.2). Samma
 * renderare som PDF:en, aldrig Puppeteer. Inget sparas.
 *
 * Body: { cv: CVMetadata, mall: string, val?: MallVal }. 300 per adress och
 * dygn. Svar: text/html.
 */
import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { checkIpRateLimit, getClientIp } from '@/lib/rate-limit/ip'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import { renderaMallHtml } from '@/lib/cv/mallval/rendera.server'
import { lasId, lasOrdning, lasTypsnitt } from '@/lib/cv/mallval/val'
import type { MallVal } from '@/lib/cv/mallar/kontrakt'
import { arSektion } from '@/lib/cv/mallval/sektioner'

export const runtime = 'nodejs'

const IP_LIMIT = 300
const SCOPE = 'cv_forhandsvisning'
/** Ett CV är några kilobyte; allt över det här är inte ett CV. */
const MAX_BYTE = 120_000

function rentVal(raw: unknown): MallVal {
  if (!raw || typeof raw !== 'object') return {}
  const r = raw as Record<string, unknown>
  const val: MallVal = {}
  const ordning = lasOrdning(r.ordning)
  if (ordning) val.ordning = ordning
  const typsnitt = lasTypsnitt(r.typsnitt)
  if (typsnitt) val.typsnitt = typsnitt
  if (typeof r.farg === 'number' && r.farg >= 0 && r.farg <= 3) val.farg = Math.floor(r.farg)
  if (r.enSida === true) val.enSida = true
  if (r.foto === true) val.foto = true
  const uppsattning = lasId(r.uppsattning)
  if (uppsattning) val.uppsattning = uppsattning
  if (r.rubriker && typeof r.rubriker === 'object') {
    const rubriker: MallVal['rubriker'] = {}
    for (const [k, v] of Object.entries(r.rubriker as Record<string, unknown>)) {
      if (arSektion(k) && typeof v === 'string' && v.trim()) rubriker[k] = v.trim().slice(0, 40)
    }
    val.rubriker = rubriker
  }
  return val
}

export async function POST(request: Request) {
  const raw = await request.text().catch(() => '')
  if (!raw || raw.length > MAX_BYTE) return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })
  let body: { cv?: unknown; mall?: unknown; val?: unknown }
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })
  }
  const mall = lasId(body.mall)
  const cv = normalizeStructuredData(body.cv)
  if (!mall || !cv) return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const rate = await checkIpRateLimit(admin, getClientIp(request), SCOPE, IP_LIMIT)
  if (!rate.allowed) return NextResponse.json({ kod: 'kvot' }, { status: 429 })

  const html = renderaMallHtml(cv, mall, rentVal(body.val))
  if (!html) return NextResponse.json({ kod: 'okand_mall' }, { status: 404 })
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
