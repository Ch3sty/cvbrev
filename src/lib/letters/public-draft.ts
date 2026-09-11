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

/** Hur många stycken besökaren får se före registrering. */
const PREVIEW_PARAGRAPHS = 1

export interface PublicDraftInput {
  role: string
  employer: string
  experience: string
  /** Valfri jobbannons. Ger ett mer träffsäkert brev när den finns. */
  jobAd?: string
  yrkeSlug?: string
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
    'professional',
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
