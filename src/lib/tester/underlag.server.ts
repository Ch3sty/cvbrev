/**
 * Underlagen (texter och tabeller) för verbalt och numeriskt, seedade på
 * sessionId, så att resultatsidan kan räkna missar, grupper och tempo på
 * servern. Samma urval som testvyn och genomgången (VerbalReview,
 * NumericalReview) använder, så frågorna står i samma ordning.
 *
 * Bara servern importerar filen: frågebankerna ska inte ligga i paketet som
 * målar resultatsidans första vy.
 */
import 'server-only'
import { selectPassagesForSession as verbalGrund } from '@/lib/verbalTestV1/selectPassages.v1'
import { selectPassagesForSession as verbalAvancerad } from '@/lib/verbalTestV2/selectPassages.v2'
import { selectProvPassagesForSession as verbalProv } from '@/lib/verbalTestProv/selectProv'
import { selectPassagesForSession as verbalExpert } from '@/lib/verbalTestExpert/selectPassages'
import { selectPassagesForSession as numGrund } from '@/lib/numericalTest/selectPassages'
import { selectPassagesForSession as numAvancerad } from '@/lib/numericalTestV2/selectPassages'
import { selectPassagesForSession as numExpert } from '@/lib/numericalTestExpert/selectPassages'
import { selectProvPassagesForSession as numProv } from '@/lib/numericalTestProv/selectProv'
import { fragorUnderlag, type ResultatFraga } from './resultat'

const URVAL: Record<string, { valj: (id: string) => unknown[]; gruppera: 'svarstyp' | 'uppgiftstyp' | 'ingen' }> = {
  'verbal-resonemang': { valj: verbalGrund, gruppera: 'svarstyp' },
  'verbal-resonemang-v2': { valj: verbalAvancerad, gruppera: 'svarstyp' },
  'verbal-resonemang-prov': { valj: verbalProv, gruppera: 'svarstyp' },
  // Argumentationsanalysen har ingen typindelning som säger något.
  'verbal-resonemang-expert': { valj: verbalExpert, gruppera: 'ingen' },
  'numeriskt-test': { valj: numGrund, gruppera: 'uppgiftstyp' },
  'numeriskt-test-v2': { valj: numAvancerad, gruppera: 'uppgiftstyp' },
  'numeriskt-test-expert': { valj: numExpert, gruppera: 'uppgiftstyp' },
  'numeriskt-test-prov': { valj: numProv, gruppera: 'uppgiftstyp' },
}

export function fragorForUnderlag(slug: string, sessionId: string, answers: unknown): ResultatFraga[] {
  const u = URVAL[slug]
  if (!u) return []
  try {
    return fragorUnderlag(u.valj(sessionId) as Parameters<typeof fragorUnderlag>[0], answers, u.gruppera)
  } catch (error) {
    console.error('Resultatsidan: kunde inte läsa underlagen', slug, error)
    return []
  }
}
