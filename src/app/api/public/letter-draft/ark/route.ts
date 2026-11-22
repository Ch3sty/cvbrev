/**
 * POST /api/public/letter-draft/ark
 *
 * Arket i startflödet (/skapa-brev/start): besökarens brev i den valda
 * mallen, med tjänsten och arbetsgivaren ur fälten och, efter utkastet,
 * första stycket. Ingen AI, ingen databas, inget sparas: brevmotorn ritar
 * en sträng (src/app/(public)/skapa-brev/start/ark.ts).
 *
 * POST och inte GET, så att det besökaren skrivit aldrig hamnar i en adress
 * eller i CDN:ets loggar. Kropp { mall, tjanst?, foretag?, stycke? }, svar
 * { mall, html }. Okänd mall ger Linne.
 */
import { NextResponse } from 'next/server'
import { idagISverige } from '@/components/publikt/brevvisare/visare-data'
import { ritaStartArk } from '@/app/(public)/skapa-brev/start/ark'

/** Mer än fälten och första stycket kan väga. */
const MAX_KROPP = 12_000

export async function POST(request: Request) {
  const text = await request.text().catch(() => '')
  if (!text || text.length > MAX_KROPP) {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }
  let body: Record<string, unknown>
  try {
    const b = JSON.parse(text)
    if (!b || typeof b !== 'object' || Array.isArray(b)) throw new Error('kropp')
    body = b as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 })
  }

  const svar = ritaStartArk({ mall: body.mall, tjanst: body.tjanst, foretag: body.foretag, stycke: body.stycke, datum: idagISverige() })
  return NextResponse.json(svar, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
}
