/**
 * Anonym brevgenerering för /skapa-brev/start (docs/plan-konvertering.md, C6).
 *
 * Delar AI-anropet med den inloggade previewen, men utan CV och utan konto:
 * besökaren beskriver sin erfarenhet i fritext i stället. Resultatet lagras
 * i public_letter_drafts och lämnas aldrig ut i sin helhet förrän någon
 * registrerar sig och gör anspråk på det.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { generateCoverLetter } from '@/lib/openai/api'

import { PREVIEW_PARAGRAPHS } from './public-draft-tal'

/** Hur många stycken besökaren får se före registrering: talet bor i public-draft-tal.ts. */
export { PREVIEW_PARAGRAPHS }

export interface PublicDraftInput {
  role: string
  employer: string
  experience: string
  /** Valfri jobbannons. Ger ett mer träffsäkert brev när den finns. */
  jobAd?: string
  yrkeSlug?: string
  /**
   * En av brevrummets fem toner (publikt omgång 3), validerad av rutten.
   * Saknas den skrivs brevet professionellt, som före omgång 3. Auto ingår
   * i Premium och tas aldrig emot här.
   */
  ton?: string
}

export interface PublicDraftResult {
  draftToken: string
  previewParagraph: string
  /** Antal rader som ligger bakom gaten, för att rita rätt antal suddade rader. */
  blurredLineCount: number
  expiresAt: string
}

/**
 * Bygger den "jobbannons" AI:n får se. Har besökaren klistrat in en riktig
 * annons använder vi den, annars sätter vi ihop en minimal beskrivning av
 * tjänsten och arbetsgivaren.
 */
function buildJobDescription(input: PublicDraftInput): string {
  if (input.jobAd && input.jobAd.trim().length > 40) {
    return input.jobAd.trim()
  }
  return [
    `Tjänst: ${input.role}`,
    `Arbetsgivare: ${input.employer}`,
    'Skriv ett personligt brev för den här tjänsten.',
  ].join('\n')
}

/** Delar upp brevet i stycken och separerar förhandsstycket från resten. */
export function splitDraft(letterText: string): {
  preview: string
  blurredLineCount: number
} {
  const paragraphs = letterText
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  const preview = paragraphs.slice(0, PREVIEW_PARAGRAPHS).join('\n\n')
  const rest = paragraphs.slice(PREVIEW_PARAGRAPHS).join('\n\n')

  // Grov radgissning för gatens suddade rader: cirka 75 tecken per rad.
  const blurredLineCount = Math.max(3, Math.min(14, Math.ceil(rest.length / 75)))

  return { preview, blurredLineCount }
}

/**
 * Genererar ett utkast och sparar det. Returnerar bara förhandsstycket:
 * resten av texten lämnar aldrig servern före claim.
 */
export async function createPublicLetterDraft(
  admin: SupabaseClient<any>,
  input: PublicDraftInput,
  ipHash: string
): Promise<PublicDraftResult> {
  const jobDescription = buildJobDescription(input)

  // Besökarens fritext går in där CV-texten annars hade legat. Den är skriven
  // av besökaren själv och innehåller ingen PII vi hämtat någon annanstans.
  const result = await generateCoverLetter(
    input.experience.trim(),
    jobDescription,
    input.ton || 'professional',
    'sv'
  )

  const letterText = result.content
  const { preview, blurredLineCount } = splitDraft(letterText)

  const { data, error } = await admin
    .from('public_letter_drafts')
    .insert({
      yrke_slug: input.yrkeSlug ?? null,
      role: input.role,
      employer: input.employer,
      letter_text: letterText,
      preview_paragraph: preview,
      ip_hash: ipHash,
    })
    .select('token, expires_at')
    .single()

  if (error || !data) {
    console.error('[public-draft] Kunde inte spara utkast:', error)
    throw new Error('Kunde inte spara utkastet')
  }

  const row = data as { token: string; expires_at: string }

  return {
    draftToken: row.token,
    previewParagraph: preview,
    blurredLineCount,
    expiresAt: row.expires_at,
  }
}

export interface PublicDraftRow {
  token: string
  role: string
  employer: string
  letter_text: string
  yrke_slug: string | null
  claimed_by: string | null
  expires_at: string
}

/** Hämtar ett utkast om det finns, är giltigt och inte redan tagits av någon annan. */
export async function getClaimableDraft(
  admin: SupabaseClient<any>,
  token: string
): Promise<PublicDraftRow | null> {
  const { data, error } = await admin
    .from('public_letter_drafts')
    .select('token, role, employer, letter_text, yrke_slug, claimed_by, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (error || !data) return null

  const row = data as unknown as PublicDraftRow
  if (new Date(row.expires_at).getTime() < Date.now()) return null

  return row
}

/**
 * Kvittot som kvitteraBrevFranPublikt skriver i user_activities när ett
 * utkast hämtats in (forsta-handling.server.ts). Det står kvar efter att
 * utkastet städats bort efter sju dygn, och är därför det som gör att
 * spärren "ett inhämtat utkast per konto" håller över tid.
 */
export const INHAMTAT_AKTIVITET = { activity_type: 'letter_created', kalla: 'publikt_startflode' } as const

/**
 * Hur många utkast kontot redan har hämtat in, det här (utomToken) oräknat.
 * Det största av två räkningar: utkast i public_letter_drafts med kontot som
 * claimed_by (finns i sju dygn), och kvittona i user_activities (finns kvar).
 * Samma utkast kan stå i båda, därför största och inte summan. Fel räknas
 * som noll, som de andra kvotfrågorna, och loggas.
 */
export async function raknaInhamtadeUtkast(
  admin: SupabaseClient<any>,
  userId: string,
  utomToken: string
): Promise<number> {
  const [utkast, kvitton] = await Promise.all([
    admin
      .from('public_letter_drafts')
      .select('token', { count: 'exact', head: true })
      .eq('claimed_by', userId)
      .neq('token', utomToken),
    admin
      .from('user_activities')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('activity_type', INHAMTAT_AKTIVITET.activity_type)
      .eq('metadata->>kalla', INHAMTAT_AKTIVITET.kalla),
  ])
  if (utkast.error) console.error('[public-draft] Kunde inte räkna inhämtade utkast:', utkast.error.message)
  if (kvitton.error) console.error('[public-draft] Kunde inte räkna kvitton för inhämtade utkast:', kvitton.error.message)
  return Math.max(utkast.count ?? 0, kvitton.count ?? 0)
}

/**
 * Kontots första inhämtade utkast (tidigast claimed_at, token som
 * skiljelinje), eller null. Läses efter att ett utkast märkts som hämtat,
 * så att två samtidiga anrop med olika utkast inte båda blir det fria.
 */
export async function forstaInhamtadeUtkast(admin: SupabaseClient<any>, userId: string): Promise<string | null> {
  const { data, error } = await admin
    .from('public_letter_drafts')
    .select('token')
    .eq('claimed_by', userId)
    .order('claimed_at', { ascending: true })
    .order('token', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error('[public-draft] Kunde inte läsa första inhämtade utkastet:', error.message)
    return null
  }
  return (data as { token?: string } | null)?.token ?? null
}

/**
 * Städar bort utgångna utkast. Exporteras för att spår D ska kunna haka in
 * den i pricing-sync-cronen. Returnerar antal borttagna rader.
 */
export async function cleanupExpiredPublicDrafts(
  admin: SupabaseClient<any>
): Promise<number> {
  try {
    const { data, error } = await admin
      .from('public_letter_drafts')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('token')

    if (error) {
      console.error('[public-draft] Kunde inte rensa utgångna utkast:', error)
      return 0
    }

    return (data as unknown[] | null)?.length ?? 0
  } catch (err) {
    console.error('[public-draft] Rensning av utgångna utkast kraschade:', err)
    return 0
  }
}
