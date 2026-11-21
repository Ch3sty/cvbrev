/**
 * Serversidan av läsbarhetspoängen: läser CV-raden poängen räknas på och
 * strukturerar ett CV en gång (och sparar det) när strukturen saknas.
 *
 * Poängen hör till CV:t, inte till analysen. Därför räknas den alltid ur
 * cv_texts (structured_data och cv_text) och aldrig ur ett tal som sparats i
 * cv_analysis_jobs.result: sparade analyser har AI:ns påhittade tal, och ett
 * CV som ändrats efter analysen ska visa sin poäng som den är nu.
 *
 * Klienten skickas in av anroparen (användarens med RLS, eller admin för
 * mejlen). Inga skrivningar utom struktureringen av ett eget CV som saknar
 * struktur, samma skrivning som /api/cv/structure gör.
 */
import 'server-only'
import { kanonisktCv } from './kanon'
import { poangForRad, type CvRad } from './forslag'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klient = any

/** CV-raden (structured_data och cv_text), eller null. */
export async function hamtaCvRad(supabase: Klient, cvId: string | null | undefined): Promise<CvRad | null> {
  if (!cvId) return null
  const { data, error } = await supabase
    .from('cv_texts')
    .select('structured_data, cv_text')
    .eq('id', cvId)
    .maybeSingle()
  if (error) {
    console.error('[poang] kunde inte läsa CV-raden', error.message)
    return null
  }
  return (data as CvRad | null) ?? null
}

/**
 * Ser till att CV:t har en sparad struktur. Saknas den struktureras CV-texten
 * en gång med samma inläsning som uppladdningen (src/lib/cv/cv-parser.ts) och
 * sparas i cv_texts.structured_data, så att samma CV därefter alltid räknas
 * på samma struktur. Returnerar raden som den ser ut efteråt.
 */
export async function sakerstallStruktur(supabase: Klient, cvId: string): Promise<CvRad | null> {
  const rad = await hamtaCvRad(supabase, cvId)
  if (!rad) return null
  if (kanonisktCv(rad.structured_data, rad.cv_text)) return rad
  const text = typeof rad.cv_text === 'string' ? rad.cv_text : ''
  if (text.length < 50) return rad
  const { parseCV } = await import('@/lib/cv/cv-parser')
  // Profilens namn och nummer maskas ordagrant före modellen (parseCV maskar
  // allt; kontaktuppgifterna sätts lokalt efter svaret).
  const { data: agare } = await supabase.from('cv_texts').select('user_id').eq('id', cvId).maybeSingle()
  const userId = (agare as { user_id?: string } | null)?.user_id
  const { data: profil } = userId
    ? await supabase.from('profiles').select('full_name, phone').eq('id', userId).maybeSingle()
    : { data: null }
  const p = profil as { full_name?: string | null; phone?: string | null } | null
  const struktur = await parseCV(text, { fullName: p?.full_name ?? null, phone: p?.phone ?? null })
  const { error } = await supabase.from('cv_texts').update({ structured_data: struktur }).eq('id', cvId)
  if (error) {
    console.error('[poang] kunde inte spara strukturen', error.message)
  }
  return { ...rad, structured_data: struktur }
}

/**
 * Poängen för senaste slutförda analysens CV, räknad ur CV-raden. Har raden
 * ingen struktur används analysens egen sparade struktur. null utan analys.
 */
export async function senasteAnalysPoang(supabase: Klient, userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('cv_analysis_jobs')
    .select('cv_id, struktur:result->structuredCV')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  const rad = data as { cv_id: string | null; struktur: unknown }
  const cv = await hamtaCvRad(supabase, rad.cv_id)
  return poangForRad(cv, rad.struktur)
}

/**
 * Poängen för en lista analyser (i den ordning de kommer), räknad ur varje
 * analys CV-rad. Analyser vars CV inte går att poängsätta faller bort.
 */
export async function poangForAnalyser(
  supabase: Klient,
  analyser: ReadonlyArray<{ cv_id: string | null; struktur?: unknown }>
): Promise<number[]> {
  const ids = [...new Set(analyser.map((a) => a.cv_id).filter((x): x is string => Boolean(x)))]
  const rader = new Map<string, CvRad>()
  if (ids.length > 0) {
    const { data } = await supabase.from('cv_texts').select('id, structured_data, cv_text').in('id', ids)
    for (const r of (data ?? []) as Array<CvRad & { id: string }>) rader.set(r.id, r)
  }
  return analyser.flatMap((a) => {
    const p = poangForRad(a.cv_id ? rader.get(a.cv_id) ?? null : null, a.struktur)
    return p === null ? [] : [p]
  })
}
