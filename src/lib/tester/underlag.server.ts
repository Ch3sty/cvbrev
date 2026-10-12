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
import { underlagsVersion, type UnderlagVersion } from './underlagVersion'

// Grund och avancerad tar sessionens underlagsversion (underlagVersion.ts).
const URVAL: Record<string, { valj: (id: string, v: UnderlagVersion) => unknown[]; gruppera: 'svarstyp' | 'uppgiftstyp' | 'ingen' }> = {
  'verbal-resonemang': { valj: (id, v) => verbalGrund(id, undefined, v), gruppera: 'svarstyp' },
  'verbal-resonemang-v2': { valj: (id, v) => verbalAvancerad(id, undefined, v), gruppera: 'svarstyp' },
  'verbal-resonemang-prov': { valj: (id) => verbalProv(id), gruppera: 'svarstyp' },
  // Argumentationsanalysen har ingen typindelning som säger något.
  'verbal-resonemang-expert': { valj: (id) => verbalExpert(id), gruppera: 'ingen' },
  'numeriskt-test': { valj: (id, v) => numGrund(id, undefined, v), gruppera: 'uppgiftstyp' },
  'numeriskt-test-v2': { valj: (id, v) => numAvancerad(id, undefined, v), gruppera: 'uppgiftstyp' },
  'numeriskt-test-expert': { valj: (id) => numExpert(id), gruppera: 'uppgiftstyp' },
  'numeriskt-test-prov': { valj: (id) => numProv(id), gruppera: 'uppgiftstyp' },
}

export function fragorForUnderlag(slug: string, sessionId: string, answers: unknown, meta?: unknown): ResultatFraga[] {
  const u = URVAL[slug]
  if (!u) return []
  try {
    return fragorUnderlag(u.valj(sessionId, underlagsVersion(meta)) as Parameters<typeof fragorUnderlag>[0], answers, u.gruppera)
  } catch (error) {
    console.error('Resultatsidan: kunde inte läsa underlagen', slug, error)
    return []
  }
}
