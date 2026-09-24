/**
 * All text i intervjuprovet, ordagrant ur copytabellen i
 * docs/design/intervjuprov-2026-09-23.html (avsnitt "Slutcopy").
 *
 * Avvikelser från tabellen, beslutade av ägaren 2026-09-23:
 * - kvot.ip: en anonym prov per IP och dygn, inte tre.
 * - kvot.inloggad och inloggad.*: provet visas även för inloggade (beslut 8),
 *   och de har varken kontoknapp eller spärr.
 *
 * Svenska facktermer, vi-form, inga talstreck, inget "AI".
 */

import { paketMedPris } from '@/lib/plans/plans'
import { FRAGOR, type FragaId } from './fragor'

/** STAR-frågorna har egna formuleringar i felraden, låset och spärren. */
const arStar = (fraga: FragaId) => FRAGOR[fraga].starChips

export const MIN_TECKEN = 200
export const MAX_TECKEN = 1200

/** Missingkind till etikettens slut: "Ditt svar, omskrivet med planen". */
export type MissingKind = 'planen' | 'resultatet' | 'exemplet' | 'kopplingen' | 'jag-formen'

export const NIVA_ETIKETTER: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'Otillräckligt',
  2: 'Tunt',
  3: 'Godkänt',
  4: 'Starkt',
  5: 'Övertygande',
}

const tal = (n: number) => n.toLocaleString('sv-SE')

const ANTAL_ORD: Record<number, string> = {
  1: 'en',
  2: 'två',
  3: 'tre',
  4: 'fyra',
  5: 'fem',
  6: 'sex',
  7: 'sju',
  8: 'åtta',
}

export const COPY = {
  eyebrow: 'Intervjuprovet',
  rubrik: 'Svara som om du satt i rummet',
  ingress:
    'Skriv ditt svar på frågan, så säger vi direkt vad som håller och vad rekryteraren saknar.',
  fraga: (text: string) => `"${text}"`,
  falt: { etikett: 'Ditt svar' },
  meta: {
    min: `Minst ${tal(MIN_TECKEN)} tecken`,
    raknare: (n: number) => `${tal(n)} av ${tal(MAX_TECKEN)}`,
  },
  knapp: { bedom: 'Bedöm mitt svar' },
  fotnot:
    'Inget konto behövs. Svaret sparas i sju dagar så att du kan hämta hela återkopplingen.',
  laddar: {
    rubrik: 'Vi läser ditt svar som en rekryterare',
    meta: 'Brukar ta under tio sekunder.',
    lang: 'Tar lite längre än vanligt, vi är kvar.',
  },
  resultat: { eyebrow: 'Din bedömning', av: 'av 5' },
  punkt: { fungerar: 'Det som fungerar', saknas: 'Det som saknas' },
  last: {
    aterkoppling: (fraga: FragaId, n: number) =>
      arStar(fraga)
        ? 'Fullständig återkoppling, del för del i STAR'
        : `Fullständig återkoppling, ${ANTAL_ORD[n] ?? tal(n)} punkter`,
    omskrivet: (kind: string) => `Ditt svar, omskrivet med ${kind}`,
    sr: 'Du ser hela återkopplingen och det omskrivna svaret när du skapat ett konto.',
  },
  sparr: {
    rubrik: 'Se hela återkopplingen och ditt svar omskrivet',
    text: (fraga: FragaId) =>
      arStar(fraga)
        ? 'Skapa ett gratiskonto så får du återkopplingen del för del och ett omskrivet svar byggt på ditt eget exempel. Vi sparar det åt dig till intervjun.'
        : 'Skapa ett gratiskonto så får du återkopplingen punkt för punkt och ett omskrivet svar byggt på ditt eget exempel. Vi sparar det åt dig till intervjun.',
    knapp: 'Skapa konto gratis',
    villkor: 'Inget kreditkort · Avsluta när du vill',
    igen: 'Skriv om och bedöm igen',
  },
  fel: {
    kort: (fraga: FragaId) =>
      arStar(fraga)
        ? `Skriv minst ${tal(MIN_TECKEN)} tecken så har vi något att bedöma. Ett par meningar om vad du gjorde räcker långt.`
        : `Skriv minst ${tal(MIN_TECKEN)} tecken så har vi något att bedöma. Ett konkret exempel från jobbet räcker långt.`,
    langt:
      'Vi bedömer upp till 1 200 tecken. Korta ner till det viktigaste, det gör svaret bättre också i rummet.',
    irrelevant: {
      rubrik: 'Det här ser inte ut som ett svar på frågan',
      text: 'Skriv hur du skulle svara rekryteraren, i jag-form och om en verklig situation. Texten finns kvar i fältet.',
      lank: 'Ändra svaret',
    },
    server: {
      rubrik: 'Vi kunde inte bedöma svaret just nu',
      text: 'Ditt svar finns kvar i fältet. Försök igen om en stund.',
      lank: 'Försök igen',
    },
    natverk: {
      rubrik: 'Vi nådde inte servern',
      text: 'Kontrollera uppkopplingen och försök igen. Ditt svar finns kvar i fältet.',
      lank: 'Försök igen',
    },
  },
  kvot: {
    ip: 'Du har gjort dagens intervjuprov. Med ett gratiskonto tränar du vidare direkt, och vi sparar svaren.',
    budget:
      'Vi har bedömt dagens svar åt besökare utan konto. Skapa ett gratiskonto så kommer du igång direkt.',
    inloggad: `Du har gjort dagens intervjuprov. Nästa öppnar i morgon, och med ${paketMedPris('test_week')}, övar du utan gräns.`,
    inloggadLank: `Se ${paketMedPris('test_week')}`,
    /** Anonym begäran på en fråga som bara finns inloggad. */
    intePublik: 'Den här frågan finns i ditt konto. Skapa ett gratiskonto så övar du på alla sju.',
  },
  /** Dashboardsidan /dashboard/intervju/[token] (spec avsnitt 5, beslut 1). */
  sida: {
    titel: 'Ditt intervjusvar, bedömt',
    beskrivning: 'Hela återkopplingen och ditt svar omskrivet. Vi sparar det i ditt konto.',
    eyebrow: 'Inför intervjun',
    dittSvar: 'Ditt svar',
    aterkoppling: 'Hela återkopplingen',
    aterkopplingStar: 'Hela återkopplingen, del för del i STAR',
    omskrivet: 'Ditt svar, omskrivet',
    platshallare:
      'Det inom hakparenteser fyller du i själv. Vi hittar aldrig på siffror eller händelser åt dig.',
    knapp: 'Öva på nästa fråga',
    sparasTill: (datum: string) => `Sparas till ${datum}.`,
    /** Den positiva statusraden sist på sidan, mot hubben. */
    rad: 'Sparat under Inför intervjun, med dina prov och din profil.',
    radLank: 'Öppna',
  },
  inloggad: {
    rubrik: 'Hela återkopplingen ligger i ditt konto',
    text: 'Där finns återkopplingen punkt för punkt och ditt svar omskrivet, sparat under Inför intervjun.',
    knapp: 'Se hela återkopplingen',
  },
} as const
