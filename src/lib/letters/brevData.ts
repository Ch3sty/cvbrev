/**
 * BrevData ur en sparad rad och profilen (kontraktet i brevmall/typer.ts).
 *
 * Avsändaren kommer alltid ur profilen här, efter AI-anropen och aldrig i
 * dem. Styckena är body_stycken, eller lat utlästa ur content för gamla brev
 * (stycken.ts). Vyerna, nedladdningen och servern bygger alla brevets data
 * härifrån, så att arket ser likadant ut överallt.
 *
 * Klientsäker och ren.
 */
import type { BrevData, BrevSprak } from './brevmall/typer'
import { kontaktIBrev, arPlatshallareTitel, type ProfilKontakt } from '@/lib/profile/dokumentKontakt'
import { styckenForBrev } from './stycken'

export interface BrevRadForData {
  company?: string | null
  job_title?: string | null
  mottagare_person?: string | null
  halsning?: string | null
  language?: string | null
  body_stycken?: unknown
  content?: string | null
  created_at?: string | null
}

/** Profilen som brevets avsändare. titel är valfri (yrkestiteln ur CV:t). */
export type BrevProfil = NonNullable<ProfilKontakt> & { titel?: string | null }

export function brevSprak(language: string | null | undefined): BrevSprak {
  return language === 'en' ? 'en' : 'sv'
}

/** ÅÅÅÅ-MM-DD i svensk tid. */
export function isoDatum(d: Date): string {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Stockholm',
  }).format(d)
}

function textEllerNull(v: string | null | undefined): string | null {
  const t = (v ?? '').trim()
  return t ? t : null
}

/**
 * Brevets data. Datumet är dagen brevet skrevs (created_at), så att samma
 * brev får samma datum i alla mallar och vid varje nedladdning.
 */
export function brevDataFranBrev(
  letter: BrevRadForData,
  profil: BrevProfil | null | undefined,
  user?: { email?: string | null } | null,
  opt: { nu?: Date } = {}
): BrevData {
  const kontakt = kontaktIBrev(profil ?? null, user ?? undefined)
  const titel = textEllerNull(profil?.titel)
  const skrivet = letter.created_at ? new Date(letter.created_at) : null
  const datum = skrivet && !Number.isNaN(skrivet.getTime()) ? skrivet : (opt.nu ?? new Date())
  return {
    avsandare: {
      namn: kontakt.namn,
      titel: titel && !arPlatshallareTitel(titel) ? titel : null,
      epost: kontakt.epost,
      telefon: kontakt.telefon || null,
      ort: kontakt.ort || null,
    },
    mottagare: {
      foretag: textEllerNull(letter.company),
      person: textEllerNull(letter.mottagare_person),
    },
    tjanst: textEllerNull(letter.job_title),
    datum: isoDatum(datum),
    halsning: textEllerNull(letter.halsning),
    stycken: styckenForBrev(letter),
    sprak: brevSprak(letter.language),
  }
}

/** Yrkestiteln ur ett CV:s structured_data (personalInfo.title), eller null. */
export function titelUrStrukturerad(structuredData: unknown): string | null {
  if (!structuredData || typeof structuredData !== 'object') return null
  const pi = (structuredData as { personalInfo?: { title?: unknown } }).personalInfo
  const t = typeof pi?.title === 'string' ? pi.title.trim() : ''
  return t && !arPlatshallareTitel(t) ? t : null
}
