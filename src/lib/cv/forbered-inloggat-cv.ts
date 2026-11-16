/**
 * CV-data för den inloggades förhandsvisning: samma tolkning och berikning
 * för preview-html (arket) och /api/cv/sidor (helskärmens sidor), så att
 * sidorna i helskärmen visar exakt det arket visar. Flyttad ur
 * preview-html/route.ts 2026-11-16 utan ändringar i beteendet.
 */
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { arPlatshallareTitel, kontaktForCv } from '@/lib/profile/dokumentKontakt'
import { lasSparadeRubriker } from '@/lib/cv/mallar/sparade-rubriker'
import { parseSwedishCVContent } from '@/lib/cv/swedish-cv-content-parser'
import { normalizeStructuredData } from '@/lib/cv/normalize-structured-data'
import type { CVMetadata } from '@/lib/cv/cv-metadata'

export interface InloggatCvIndata {
  cvText?: string
  /** CVMetadata eller äldre ParsedCV; normalizeStructuredData tar båda. */
  structuredData?: unknown
  /** CV:ts id i cv_texts, så att sparade rubriker följer med. */
  cvId?: string
}

export type InloggatCvUtfall = { ok: true; cv: CVMetadata } | { ok: false; status: number; error: string }

export async function forberedInloggatCv(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  user: User,
  { cvText, structuredData, cvId }: InloggatCvIndata
): Promise<InloggatCvUtfall> {
  // Använd structuredData direkt om det finns och är i rätt format. Äldre
  // CV:n kan vara sparade i ParsedCV-format; normaliseraren hanterar båda
  // och faller tillbaka till regex-parsern på cvText om strukturen är trasig.
  let cvData: CVMetadata | null = null
  let kontaktKalla: 'strukturerad' | 'text' = 'strukturerad'
  if (structuredData) {
    cvData = normalizeStructuredData(structuredData)
  }
  if (!cvData) {
    if (!cvText) return { ok: false, status: 400, error: 'CV-data saknas eller kan inte tolkas' }
    try {
      cvData = await parseSwedishCVContent(cvText)
      kontaktKalla = 'text'
    } catch {
      return { ok: false, status: 500, error: 'Kunde inte tolka CV-text' }
    }
  }

  // Berika med profildata så att förhandsvisningen matchar PDF:en (foto och LinkedIn).
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('profile_photo_url, linkedin_url, full_name, email, contact_email, phone, location')
    .eq('id', user.id)
    .single()

  if (userProfile && cvData.personalInfo) {
    if (userProfile.profile_photo_url) {
      cvData.personalInfo.profilePhotoUrl = userProfile.profile_photo_url
    }
    if (userProfile.linkedin_url) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!cvData.personalInfo.linkedIn && !(cvData.personalInfo as any).linkedin) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(cvData.personalInfo as any).linkedin = userProfile.linkedin_url
      }
    }
    // Samma regel som PDF:en i generate-formatted: det användaren skrivit i
    // CV:t vinner, profilen fyller tomma fält och platshållare.
    const kontakt = kontaktForCv(cvData.personalInfo, userProfile, user, kontaktKalla)
    cvData.personalInfo.fullName = kontakt.fullName
    cvData.personalInfo.email = kontakt.email
    cvData.personalInfo.phone = kontakt.phone
    cvData.personalInfo.address = kontakt.address
    if (arPlatshallareTitel(cvData.personalInfo.title)) cvData.personalInfo.title = ''
  }

  // Rubrikerna CV:t sparat (cv_texts.section_titles); valet i anropet går före.
  if (cvId) {
    const sparade = await lasSparadeRubriker(supabase, user.id, cvId)
    if (sparade) cvData.sectionTitles = sparade
  }

  return { ok: true, cv: cvData }
}
