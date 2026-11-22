/**
 * CV-texten så som användaren ser den som löptext: Råtext i Byt CV-arket och
 * förhandsraden i Jobbcoachens dokumentval.
 *
 * cv_text sparas maskad ([EMAIL], [TEL] och så vidare, maskaLagradCvText i
 * src/lib/privacy/lagradCvText.ts). Byggaren, arbetsläget, förslagen,
 * LinkedIn-importen och provsidan sparar texten ur strukturen, och före
 * 2026-11-21 sparades den omaskad. För de CV:na skrivs texten därför ur
 * strukturen här, med samma funktion som skrev den, så att användaren ser
 * sina egna uppgifter precis som förut. Uppladdade CV utan sådan struktur
 * visar den lagrade texten som de alltid gjort.
 *
 * Bara för visning. Det som går till en modell är den lagrade, maskade texten.
 * Klientsäker.
 */
import type { CVMetadata } from './cv-metadata'
import { formatCVMetadataAsText } from '@/lib/linkedin/linkedin-to-cv-converter'

/** Platshållarna maskaLagradCvText sätter in. */
const LAGRAD_PLATSHALLARE = /\[(?:EMAIL|TEL|ADRESS|POSTNR|PERSNR|URL)\]/

function arCvMetadata(v: unknown): v is CVMetadata {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return false
  const o = v as Record<string, unknown>
  return !!o.personalInfo && typeof o.personalInfo === 'object' && !Array.isArray(o.roles)
}

export function cvTextForVisning(cvText: string | null | undefined, structuredData: unknown): string | null {
  if (!cvText || !LAGRAD_PLATSHALLARE.test(cvText) || !arCvMetadata(structuredData)) return cvText ?? null
  try {
    const ur = formatCVMetadataAsText(structuredData)
    return ur.trim() ? ur : cvText
  } catch {
    return cvText
  }
}
