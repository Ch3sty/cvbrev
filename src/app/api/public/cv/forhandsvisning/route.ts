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
import { renderaMallHtml } from '@/lib/cv/rendera-mall-html'
import { tolkaVal } from '@/lib/cv/mallar/val'
import { lasId } from '@/lib/cv/mallval/val'

export const runtime = 'nodejs'

const IP_LIMIT = 300
const SCOPE = 'cv_forhandsvisning'
/** Ett CV är några kilobyte; allt över det här är inte ett CV. */
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
  const mall = lasId(body.mall)
  const cv = normalizeStructuredData(body.cv)
  if (!mall || !cv) return NextResponse.json({ kod: 'ogiltig' }, { status: 400 })

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const rate = await checkIpRateLimit(admin, getClientIp(request), SCOPE, IP_LIMIT)
  if (!rate.allowed) return NextResponse.json({ kod: 'kvot' }, { status: 429 })

  const html = renderaMallHtml(cv, mall, tolkaVal(body.val), { forhandsvisning: true })
  if (!html) return NextResponse.json({ kod: 'okand_mall' }, { status: 404 })
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}
