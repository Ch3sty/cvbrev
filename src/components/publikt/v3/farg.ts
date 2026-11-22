/**
 * Sidornas färger i publikt omgång 3 (docs/design/publikt-omgang3/BRIEF.md).
 *
 * Fem färger, samma som delarna inloggat: tester indigo, CV petrol,
 * personliga brev plommon, Jobbsöket skog och grafit för resten. Värdena
 * står i globals.css under "PUBLIKT OMGÅNG 3".
 *
 * Inloggat använder data-rum och lyfter det till roten med
 * :root:has([data-rum]). Publikt har egna attribut, så att inget av
 * inloggats regler slår på publikt och tvärtom:
 *   data-p3-sida   sidans färg, sätts av <Sida>, lyfts till roten (meny, fot)
 *   data-p3-farg   en yta i en annan färg (ö, kort, menyns kolumner), bara lokalt
 *   data-p3-sokvag menyns gissning ur adressen, gäller bara när sidan saknar <Sida>
 *
 * Ren data, inga komponenter: läses av både server och klient.
 */

export type Farg = 'tran' | 'cv' | 'brev' | 'jobb' | 'neutral'

export const FARGER: readonly Farg[] = ['tran', 'cv', 'brev', 'jobb', 'neutral']

/** Färgernas namn i förhandsvisningen och dokumentationen. */
export const FARG_NAMN: Record<Farg, string> = {
  tran: 'Rekryteringstester (indigo)',
  cv: 'CV (petrol)',
  brev: 'Personliga brev (plommon)',
  jobb: 'Jobbsöket (skog)',
  neutral: 'Övrigt (grafit)',
}

const REGLER: readonly [Farg, readonly string[]][] = [
  ['tran', ['/verktyg/rekryteringstester', '/verktyg/personlighetstest', '/funktioner', '/priser', '/om-oss']],
  ['cv', ['/verktyg/cv-analys', '/verktyg/skapa-cv', '/verktyg/linkedin-optimering', '/cv-mallar', '/cv-exempel']],
  ['brev', ['/verktyg/personligt-brev', '/personligt-brev-exempel', '/skapa-brev']],
  ['jobb', ['/verktyg/jobbmatchning', '/verktyg/jobbcoachen', '/verktyg/bli-upptackt', '/verktyg/sokta-tjanster', '/jobbkartan']],
]

/**
 * Färgen för en adress när sidan själv inte har sagt något. Startsidan och
 * sidorna om hela produkten står i indigo (skissen meny), allt utan egen
 * del i grafit. En sida som har <Sida farg> vinner alltid över det här.
 */
export function fargForSokvag(sokvag: string | null | undefined): Farg {
  const s = (sokvag ?? '/').split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  if (s === '/') return 'tran'
  for (const [farg, prefix] of REGLER) {
    if (prefix.some((p) => s === p || s.startsWith(p + '/'))) return farg
  }
  return 'neutral'
}
