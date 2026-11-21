/**
 * TILLFÄLLIG (arket, 2026-11-21): brevets data för nedladdningen tills
 * motorns `brevDataFranBrev(letter, profil)` i src/lib/letters/ är
 * sammanslagen. Samma signatur: vid sammanslagningen byts importen i
 * route.ts och den här filen tas bort.
 *
 * Läser motorns kolumner (byggspecen avsnitt 3): body_stycken, halsning,
 * mottagare_person, mall_id, font_id. Ett brev utan body_stycken men med
 * mall_id får sina stycken ur `content` (div.body-content), som när ett
 * gammalt brev öppnas för ändring.
 */
import { extractEditableContent } from '@/lib/letters/extract-editable-content'
import type { BrevData, BrevSprak } from '@/lib/letters/brevmall/typer'

/** Det nedladdningen läser ur raden i letters (motorns nya kolumner är valfria tills typerna är uppdaterade). */
export interface BrevRad {
  id: string
  company?: string | null
  job_title?: string | null
  title?: string | null
  content?: string | null
  body_stycken?: unknown
  halsning?: string | null
  mottagare_person?: string | null
  mall_id?: string | null
  font_id?: string | null
  sprak?: string | null
  language?: string | null
}

/** Avsändaren ur profilen (kontaktIBrev), med titeln om den finns. */
export interface BrevProfil {
  namn: string
  epost: string
  telefon?: string | null
  ort?: string | null
  titel?: string | null
}

function stycken(rad: BrevRad): string[] {
  if (Array.isArray(rad.body_stycken)) return rad.body_stycken.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
  if (!rad.content) return []
  return extractEditableContent(rad.content)
    .split(/\n\s*\n/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

/** Dagens datum i Sverige som ÅÅÅÅ-MM-DD. */
function idag(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })
}

export function brevDataFranBrev(letter: BrevRad, profil: BrevProfil): BrevData {
  const s = letter.sprak ?? letter.language
  const sprak: BrevSprak = s === 'en' ? 'en' : 'sv'
  return {
    avsandare: { namn: profil.namn, titel: profil.titel ?? null, epost: profil.epost, telefon: profil.telefon || null, ort: profil.ort || null },
    mottagare: { foretag: letter.company?.trim() || null, person: letter.mottagare_person?.trim() || null },
    tjanst: letter.job_title?.trim() || null,
    datum: idag(),
    halsning: letter.halsning?.trim() || null,
    stycken: stycken(letter),
    sprak,
  }
}
