/**
 * Mallar på servern: brevets data för förhandsvisningen och brevet ritat i
 * flera mallar. Sidan (/dashboard/mina-brev/mallar) och rutten
 * POST /api/letters/[id]/forhandsvisa delar det här, så att arket ser
 * likadant ut i första HTML:en och efter ett byte.
 *
 * Ingen AI, ingen kvot, ingen skrivning. Bara server.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { renderBrevHtml } from '@/lib/letters/brevmall'
import { brevMallId } from '@/lib/letters/brevRegler'
import { exempelBrev } from '@/lib/letters/brevmall/exempel'
import type { BrevData } from '@/lib/letters/brevmall/typer'
import { brevDataFranBrev, titelUrStrukturerad, type BrevRadForData } from '@/lib/letters/brevData'
import { hamtaBrevProfil, startmallForCv } from '@/lib/letters/server'
import { cvMallUrStrukturerad } from '@/lib/letters/brevRegler'

type Klient = SupabaseClient<any, any, any>

export interface MallarKalla {
  data: BrevData
  /** Mallen brevet får när det flyttas till nya formatet (CV:ts mall eller Linne). */
  startmall: string
  /** CV-mallen för brevets CV (eller det senaste CV:t), om den går att läsa ut. */
  cvMall: string | null
  /** Sant när data är exempelbrevet (användaren har inga brev). */
  exempel: boolean
}

/**
 * Brevets data. Utan brev: exempelbrevet till Nordanvind Energi med
 * användarens eget namn och kontakt, och titeln ur det senaste CV:t.
 */
export async function mallarKalla(
  supabase: Klient,
  user: { id: string; email?: string | null },
  rad: (BrevRadForData & { cv_id?: string | null }) | null,
  harBetalt: boolean
): Promise<MallarKalla> {
  let cvId = rad?.cv_id ?? null
  if (!rad) {
    const { data } = await supabase.from('cv_texts').select('id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    cvId = (data as { id?: string } | null)?.id ?? null
  }
  const { profil, cvStrukturerad } = await hamtaBrevProfil(supabase, user.id, cvId)
  const startmall = startmallForCv(cvStrukturerad, harBetalt)
  const cvMall = cvMallUrStrukturerad(cvStrukturerad)
  if (rad) return { data: brevDataFranBrev(rad, profil, user), startmall, cvMall, exempel: false }
  const egen = brevDataFranBrev({}, profil, user).avsandare
  const titel = egen.titel ?? titelUrStrukturerad(cvStrukturerad)
  return { data: exempelBrev('normal', { ...egen, titel }), startmall, cvMall, exempel: true }
}

/** Högst så här många mallar per anrop (hela katalogen). */
export const MAX_MALLAR = 40

/** Brevet ritat i varje mall: mallens id -> fristående HTML. Okända id hoppas över. */
export function ritaIMallar(data: BrevData, mallar: readonly unknown[], fontId: string | null): Record<string, string> {
  const ut: Record<string, string> = {}
  for (const m of mallar.slice(0, MAX_MALLAR)) {
    const id = brevMallId(m)
    if (!id || ut[id]) continue
    ut[id] = renderBrevHtml(id, data, { typsnitt: fontId })
  }
  return ut
}
