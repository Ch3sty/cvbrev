/**
 * CV:ts sparade rubriker (cv_texts.section_titles, migreringen
 * 20261116120000_cv_section_titles). Server: läses där CV:t renderas
 * (generate-formatted, preview-html) och skrivs av PUT /api/cv/section-titles.
 *
 * Läsningen fäller aldrig en nedladdning: ett fel (kolumnen saknas, nätet)
 * ger null, och då gäller rubrikmodellens förval.
 */
import { rensaRubriker } from '../rubriker'
import type { Sektion } from './kontrakt'

// Supabase-klienten har olika typer i olika rutter; här räcker formen.
type Klient = {
  from: (tabell: string) => any // eslint-disable-line @typescript-eslint/no-explicit-any
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function arCvId(id: unknown): id is string {
  return typeof id === 'string' && UUID.test(id)
}

export async function lasSparadeRubriker(
  supabase: Klient,
  userId: string,
  cvId: unknown
): Promise<Partial<Record<Sektion, string>> | null> {
  if (!arCvId(cvId)) return null
  try {
    const { data, error } = await supabase
      .from('cv_texts')
      .select('section_titles')
      .eq('id', cvId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error || !data) return null
    const r = rensaRubriker((data as { section_titles?: unknown }).section_titles)
    return Object.keys(r).length ? r : null
  } catch {
    return null
  }
}
