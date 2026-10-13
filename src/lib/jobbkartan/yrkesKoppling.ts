/**
 * Kopplingen mellan yrkessidornas slug (/cv-exempel/[yrke] och /personligt-brev-exempel/[yrke])
 * och yrkeskoderna (SSYK 2012) i Jobbkartans data. Uttrycklig och handverifierad 2026-10-13:
 * varje rad har yrkets namn som det står i SCB:s data, och vitest kontrollerar att koden finns
 * och att namnet stämmer (src/lib/jobbkartan/__tests__/yrkesKoppling.test.ts).
 *
 * Regeln är hellre färre sidor med rätt data än fel data. En sida som spänner över flera
 * yrken utan ett tydligt huvudyrke får ingen rad. Ej kopplade bland de 20 mest klickade
 * (GSC 14 sep till 11 okt 2026):
 *   handlaggare                  handläggare finns i minst fem SSYK-koder (socialsekreterare,
 *                                socialförsäkring, skatt, bistånd, övriga)
 *   servitris-restaurangbitrade  två yrken i ett (5131 servitörer och 9412 restaurangbiträden)
 *   hemtjanst                    hemtjänstpersonal är både undersköterskor (5321) och vårdbiträden (5330)
 *   larare                       sidan heter Lärare men exemplet är grundskollärare, sju lärarkoder
 *   ingenjor                     ett tjugotal ingenjörskoder, CV och brev har olika inriktning
 *   saljare                      sidan heter Säljare, exemplet är företagssäljare, åtta säljkoder
 *
 * Flera koder summeras bara när de tillsammans är exakt sidans yrke (butikssäljare =
 * dagligvaror + fackhandel). Då visas ingen lön, eftersom medellönen inte går att lägga ihop.
 * Den första koden är den som länken till /jobbkartan öppnar.
 *
 * Yrkesfilerna importeras statiskt, så att de följer med serverbygget och läses utan fs.
 * Uppdateras när scripts/jobbkartan/hamta-data.mjs körs (filerna skrivs om på samma plats).
 */
import y2222 from '../../../public/jobbkartan/data/yrke/2222.json'
import y2241 from '../../../public/jobbkartan/data/yrke/2241.json'
import y2342 from '../../../public/jobbkartan/data/yrke/2342.json'
import y3313 from '../../../public/jobbkartan/data/yrke/3313.json'
import y4112 from '../../../public/jobbkartan/data/yrke/4112.json'
import y4117 from '../../../public/jobbkartan/data/yrke/4117.json'
import y5152 from '../../../public/jobbkartan/data/yrke/5152.json'
import y5222 from '../../../public/jobbkartan/data/yrke/5222.json'
import y5223 from '../../../public/jobbkartan/data/yrke/5223.json'
import y5311 from '../../../public/jobbkartan/data/yrke/5311.json'
import y5312 from '../../../public/jobbkartan/data/yrke/5312.json'
import y5330 from '../../../public/jobbkartan/data/yrke/5330.json'
import y9412 from '../../../public/jobbkartan/data/yrke/9412.json'
import y9413 from '../../../public/jobbkartan/data/yrke/9413.json'
import y9622 from '../../../public/jobbkartan/data/yrke/9622.json'

export interface YrkeFil {
  kod: string
  namn: string
  /** Anställda per län (lanKoder) och år (ar), länen i följd. */
  lan: number[]
  kon: number[]
  /** Riksområde (lonRegioner) × lönår (lonAr), 0 = saknas. */
  lon: number[][] | null
}

export const YRKESFILER: Record<string, YrkeFil> = {
  '2222': y2222,
  '2241': y2241,
  '2342': y2342,
  '3313': y3313,
  '4112': y4112,
  '4117': y4117,
  '5152': y5152,
  '5222': y5222,
  '5223': y5223,
  '5311': y5311,
  '5312': y5312,
  '5330': y5330,
  '9412': y9412,
  '9413': y9413,
  '9622': y9622,
} as Record<string, YrkeFil>

export interface YrkesKoppling {
  /** SSYK 2012, fyra siffror. Den första öppnas av länken till /jobbkartan. */
  koder: string[]
  /** Namnen så som de står i SCB:s data, i samma ordning som koderna. Kontrolleras av vitest. */
  scbNamn: string[]
  /** Böjningen i rubriken: "Var jobben finns för {plural}". */
  plural: string
}

export const YRKES_KOPPLING: Record<string, YrkesKoppling> = {
  elevassistent: { koder: ['5312'], scbNamn: ['Elevassistenter m.fl.'], plural: 'elevassistenter' },
  psykolog: { koder: ['2241'], scbNamn: ['Psykologer'], plural: 'psykologer' },
  fastighetsskotare: { koder: ['5152'], scbNamn: ['Fastighetsskötare'], plural: 'fastighetsskötare' },
  loneadministrator: {
    koder: ['4112'],
    scbNamn: ['Löne- och personaladministratörer'],
    plural: 'löneadministratörer',
  },
  vardbitrade: { koder: ['5330'], scbNamn: ['Vårdbiträden'], plural: 'vårdbiträden' },
  vardadministrator: {
    koder: ['4117'],
    scbNamn: ['Medicinska sekreterare, vårdadministratörer m.fl.'],
    plural: 'vårdadministratörer',
  },
  barnmorska: { koder: ['2222'], scbNamn: ['Barnmorskor'], plural: 'barnmorskor' },
  koksbitrade: { koder: ['9412'], scbNamn: ['Restaurang- och köksbiträden m.fl.'], plural: 'köksbiträden' },
  redovisningsekonom: { koder: ['3313'], scbNamn: ['Redovisningsekonomer'], plural: 'redovisningsekonomer' },
  vaktmastare: { koder: ['9622'], scbNamn: ['Vaktmästare m.fl.'], plural: 'vaktmästare' },
  fritidspedagog: { koder: ['2342'], scbNamn: ['Fritidspedagoger'], plural: 'fritidspedagoger' },
  barnskotare: { koder: ['5311'], scbNamn: ['Barnskötare'], plural: 'barnskötare' },
  // Barista klassas i SSYK 2012 under 9413 Kafé- och konditoribiträden.
  barista: { koder: ['9413'], scbNamn: ['Kafé- och konditoribiträden'], plural: 'baristor' },
  butikssaljare: {
    koder: ['5223', '5222'],
    scbNamn: ['Butikssäljare, fackhandel', 'Butikssäljare, dagligvaror'],
    plural: 'butikssäljare',
  },
}
