/**
 * Sidornas färger i publikt omgång 3 (docs/design/publikt-omgang3/BRIEF.md).
 *
 * Fyra färger, samma som delarna inloggat: tester indigo, CV petrol,
 * personliga brev plommon och Jobbsöket skog. Värdena står i globals.css
 * under "PUBLIKT OMGÅNG 3".
 *
 * Grafiten (neutral) finns inte publikt längre (ägaren 2026-11-22: inget
 * svart, och grafiten läses som svart). Sidor utan egen del står i indigo,
 * samma som startsidan: FARG_OVRIGT. Det är förvalet i <Sida> och i menyns
 * gissning ur adressen, så en ny sida behöver inte säga något.
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

export type Farg = 'tran' | 'cv' | 'brev' | 'jobb'

export const FARGER: readonly Farg[] = ['tran', 'cv', 'brev', 'jobb']

/** Färgen för allt som inte hör till en egen del: indigo, som startsidan. */
export const FARG_OVRIGT: Farg = 'tran'

/** Färgernas namn i förhandsvisningen och dokumentationen. */
export const FARG_NAMN: Record<Farg, string> = {
  tran: 'Rekryteringstester och övrigt (indigo)',
  cv: 'CV (petrol)',
  brev: 'Personliga brev (plommon)',
  jobb: 'Jobbsöket (skog)',
}

const REGLER: readonly [Farg, readonly string[]][] = [
  ['tran', ['/verktyg/rekryteringstester', '/verktyg/personlighetstest', '/funktioner', '/priser', '/om-oss']],
  ['cv', ['/verktyg/cv-analys', '/verktyg/skapa-cv', '/verktyg/linkedin-optimering', '/cv-mallar', '/cv-exempel']],
  ['brev', ['/verktyg/personligt-brev', '/personligt-brev-exempel', '/skapa-brev']],
  // Bli upptäckt hör till Jobbsöket, och rekryterarsidorna är dess andra sida.
  // Kalkylatorerna står i samma färg som navet /rakna-ut.
  ['jobb', ['/verktyg/jobbmatchning', '/verktyg/jobbcoachen', '/verktyg/bli-upptackt', '/verktyg/sokta-tjanster', '/jobbkartan', '/for-rekryterare', '/rakna-ut']],
]

/**
 * Färgen för en adress när sidan själv inte har sagt något. Startsidan,
 * sidorna om hela produkten och allt utan egen del står i indigo
 * (FARG_OVRIGT). En sida som har <Sida farg> vinner alltid över det här.
 */
export function fargForSokvag(sokvag: string | null | undefined): Farg {
  const s = (sokvag ?? '/').split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  if (s === '/') return FARG_OVRIGT
  for (const [farg, prefix] of REGLER) {
    if (prefix.some((p) => s === p || s.startsWith(p + '/'))) return farg
  }
  return FARG_OVRIGT
}
