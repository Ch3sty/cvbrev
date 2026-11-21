/**
 * Brevrummets serverfrågor: listan, låset, sökt-kopplingen, profilen som
 * avsändare och förberett. Sidorna (serverkomponenterna i etapp 2) och
 * rutterna i src/app/api/letters använder samma funktioner, så att regeln
 * är en och samma i listan, i brevvyn och i alla skrivande rutter.
 *
 * Bara server: tar en Supabase-klient med användarens session (RLS gäller).
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { userHasAccess } from '@/lib/supabase/premiumAccess'
import type { BrevKrav } from './brevmall/typer'
import type { Letter } from '@/store/letter-store'
import { arBrevLast, brevlista, type BrevRadForLista } from './lista'
import { brevKvot, type BrevKvot } from './brevKvot'
import { kravForBrev } from './lage'
import { brevDataFranBrev, titelUrStrukturerad, type BrevProfil } from './brevData'
import { ritaBrevHtml } from './ritaBrev'
import { cvMallUrStrukturerad, startmallForBrev } from './brevRegler'

type Klient = SupabaseClient<any, any, any>

/** Kolumnerna låsregeln behöver. */
const LASKOLUMNER = 'id, is_saved, job_description, updated_at, created_at'

/** Profilens kolumner för avsändaren och kvoten. */
export const BREVPROFIL_KOLUMNER =
  'full_name, email, contact_email, phone, location, include_phone_in_letters, include_location_in_letters, weekly_letter_count, weekly_letter_first_used_at'

export type BrevIListan = Letter & {
  isLocked: boolean
  /** Datum (applied_at) då brevet markerades som sökt, annars null. */
  soktDatum: string | null
  /** Id på raden i Sökta tjänster, annars null. */
  ansokanId: string | null
  /** Kraven med träffar omräknade mot texten, null = inget kravmått. */
  kravTraffar: BrevKrav[] | null
}

export interface Brevlista {
  brev: BrevIListan[]
  harBetalt: boolean
  kvot: BrevKvot
}

/** Sökta tjänster per brev: letter_id -> { id, applied_at }. */
export async function hamtaSokta(
  supabase: Klient,
  userId: string,
  letterIds?: readonly string[]
): Promise<Map<string, { id: string; applied_at: string | null }>> {
  let q = supabase.from('job_applications').select('id, letter_id, applied_at').eq('user_id', userId).not('letter_id', 'is', null)
  if (letterIds) {
    if (letterIds.length === 0) return new Map()
    q = q.in('letter_id', letterIds as string[])
  }
  const { data, error } = await q
  if (error) {
    console.error('Sökta tjänster kunde inte läsas:', error.message)
    return new Map()
  }
  const ut = new Map<string, { id: string; applied_at: string | null }>()
  for (const r of (data ?? []) as Array<{ id: string; letter_id: string; applied_at: string | null }>) {
    const fore = ut.get(r.letter_id)
    if (!fore || (r.applied_at ?? '') < (fore.applied_at ?? '')) ut.set(r.letter_id, { id: r.id, applied_at: r.applied_at })
  }
  return ut
}

/**
 * Listan Dina brev: alla brev, avdubblade, senast uppdaterade först, med
 * lås, sökt-koppling, kravträffar och kvoten. Tre frågor parallellt plus
 * behörigheten.
 */
export async function hamtaBrevlista(supabase: Klient, userId: string): Promise<Brevlista> {
  const [breven, profil, harBetalt, sokta] = await Promise.all([
    supabase.from('letters').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    supabase.from('profiles').select('weekly_letter_count, weekly_letter_first_used_at').eq('id', userId).maybeSingle(),
    userHasAccess(supabase, userId, 'any'),
    hamtaSokta(supabase, userId),
  ])
  if (breven.error) throw new Error(breven.error.message)

  const rader = (breven.data ?? []) as Letter[]
  const brev = brevlista(rader, harBetalt).map((b) => {
    const s = sokta.get(b.id)
    return { ...b, soktDatum: s?.applied_at ?? null, ansokanId: s?.id ?? null, kravTraffar: kravForBrev(b) }
  })
  return { brev, harBetalt, kvot: brevKvot(profil.data as any, harBetalt) }
}

/** Är brevet låst för användaren? Läser användarens alla rader (bara låskolumnerna). */
export async function arBrevLastForAnvandare(
  supabase: Klient,
  userId: string,
  letterId: string,
  harBetalt: boolean
): Promise<boolean> {
  if (harBetalt) return false
  const { data, error } = await supabase.from('letters').select(LASKOLUMNER).eq('user_id', userId)
  if (error) throw new Error(error.message)
  return arBrevLast(letterId, (data ?? []) as BrevRadForLista[], false)
}

/** Svaret när ett låst brev ska ändras: 403 letter_locked. */
export const LAST_SVAR = { error: 'letter_locked', code: 'letter_locked' } as const

/**
 * Profilen som avsändare, med yrkestiteln ur CV:t när brevet har ett.
 * Returnerar även kvotkolumnerna.
 */
export async function hamtaBrevProfil(
  supabase: Klient,
  userId: string,
  cvId?: string | null
): Promise<{ profil: (BrevProfil & { weekly_letter_count?: number | null; weekly_letter_first_used_at?: string | null }) | null; cvStrukturerad: unknown }> {
  const [p, cv] = await Promise.all([
    supabase.from('profiles').select(BREVPROFIL_KOLUMNER).eq('id', userId).maybeSingle(),
    cvId
      ? supabase.from('cv_texts').select('structured_data').eq('id', cvId).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ])
  const cvStrukturerad = (cv as { data: { structured_data?: unknown } | null }).data?.structured_data ?? null
  const profil = p.data ? { ...(p.data as object), titel: titelUrStrukturerad(cvStrukturerad) } : null
  return { profil: profil as any, cvStrukturerad }
}

/** Mallen ett brev får från start, ur CV:ts structured_data (avsnitt 4). */
export function startmallForCv(cvStrukturerad: unknown, harBetalt: boolean): string {
  return startmallForBrev(cvMallUrStrukturerad(cvStrukturerad), harBetalt)
}

/** content för en rad: brevets data ur raden och profilen, ritat i vald mall. */
export function ritaRad(
  rad: Parameters<typeof brevDataFranBrev>[0] & { mall_id?: string | null; template_id?: string | null; font_id?: string | null },
  profil: BrevProfil | null,
  user?: { email?: string | null } | null
): string {
  return ritaBrevHtml(
    { mall_id: rad.mall_id ?? null, template_id: rad.template_id ?? null, font_id: rad.font_id ?? null },
    brevDataFranBrev(rad, profil, user)
  )
}

export type ForberettSom = 'kopierat' | 'nedladdat'

/**
 * Sätter forberett_at första gången brevet kopieras eller laddas ner.
 * Rör inte updated_at: att kopiera ett låst brev får inte öppna det.
 * Tillåtet på låsta brev (läsa och kopiera ingår gratis). Ger raden efteråt,
 * eller null om brevet inte finns.
 */
export async function markeraForberett(
  supabase: Klient,
  userId: string,
  letterId: string,
  som: ForberettSom
): Promise<{ forberett_at: string; forberett_som: string | null } | null> {
  const { data: rad, error } = await supabase
    .from('letters')
    .select('id, forberett_at, forberett_som')
    .eq('id', letterId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!rad) return null
  const r = rad as { forberett_at: string | null; forberett_som: string | null }
  if (r.forberett_at) return { forberett_at: r.forberett_at, forberett_som: r.forberett_som }

  const nu = new Date().toISOString()
  const { data: ny, error: upErr } = await supabase
    .from('letters')
    .update({ forberett_at: nu, forberett_som: som })
    .eq('id', letterId)
    .eq('user_id', userId)
    .is('forberett_at', null)
    .select('forberett_at, forberett_som')
    .maybeSingle()
  if (upErr) throw new Error(upErr.message)
  // Ett samtidigt anrop hann före: läs det som står.
  if (!ny) {
    const { data: igen } = await supabase.from('letters').select('forberett_at, forberett_som').eq('id', letterId).maybeSingle()
    return (igen as any) ?? null
  }
  return ny as { forberett_at: string; forberett_som: string | null }
}
