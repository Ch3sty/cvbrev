/**
 * Mallkatalogen: det komponenterna vet om varje mall (MallKort i
 * kontrakt.ts), i visningsordning, gratismallarna först.
 *
 * Klientsäker och liten: ren data. Den drar inte in renderaren, registret
 * eller någon CSS (komponenternas JS-budget, plan avsnitt 6). Definitionerna
 * (definitioner/*.ts) hämtar sina kortfält härifrån med `franKatalog`, och
 * testet i __tests__/mallsystemet.test.ts fäller om katalogen och registret
 * glider isär.
 *
 * Utbudet: docs/design/mallar-utbud-2026-11-16.md (art-director). Namnen
 * efter stil, aldrig yrke; alla passar alla yrken.
 */
import type { Familj, MallKort, Niva, TypsnittId } from './kontrakt'
import type { MallKortFalt } from './typer'

/** Miniatyrernas sökvägar (scripts/mallbilder.ts skriver dem). */
export function mallBild(id: string): MallKort['bild'] {
  return { liten: `/mallar/v2/${id}-liten.webp`, stor: `/mallar/v2/${id}-stor.webp` }
}

type Rad = [
  id: string,
  namn: string,
  niva: Niva,
  familj: Familj,
  word: boolean,
  foto: boolean,
  typsnitt: TypsnittId,
  stil: string,
  kort: string,
  accenter: [string, string, string, string],
]

const RADER: Rad[] = [
  ['linne', 'Linne', 'gratis', 'en-spalt', true, false, 'calibri', 'Georgia-namn, Calibri-text, tunn linje under rubrikerna', 'Klassisk och luftig', ['#1F3A5F', '#1E5A3C', '#7A1F2B', '#3A3A3A']],
  ['bjork', 'Björk', 'gratis', 'en-spalt', true, true, 'arial', 'Centrerat huvud med rund fotoplats, accentstapel vid rubrikerna', 'Centrerad, med foto', ['#1E5A3C', '#1F3A5F', '#8A4B2A', '#5B2A4E']],
  ['koppar', 'Koppar', 'premium', 'en-spalt', true, true, 'calibri', 'Färgat huvudband med vit text och rund fotoplats', 'Färgat huvud, foto', ['#8A4B2A', '#1F3A5F', '#1E5A3C', '#2B2F36']],
  ['kalksten', 'Kalksten', 'premium', 'sidospalt', true, true, 'calibri', 'Ljusgrå vänsterspalt med intygsfält, kvadratiskt foto', 'Sidospalt och foto', ['#3B5A78', '#1E5A3C', '#7A1F2B', '#4A5561']],
  ['granit', 'Granit', 'premium', 'sidospalt', true, true, 'arial', 'Mörkt huvudband som fortsätter i mörk högerspalt', 'Mörk sidospalt, foto', ['#2B2F36', '#1F3A5F', '#1E5A3C', '#5B2A4E']],
  ['kolumn', 'Kolumn', 'premium', 'marginal', true, false, 'garamond', 'Garamond, rubrikerna i en vänsterkolumn', 'Rubriker i marginalen', ['#3A3A3A', '#1F3A5F', '#7A1F2B', '#1E5A3C']],
  ['arsring', 'Årsring', 'premium', 'marginal', true, false, 'calibri', 'Årtalen i vänsterkolumnen med lodrät accentlinje', 'Årtalen i marginalen', ['#1E5A3C', '#1F3A5F', '#8A4B2A', '#2B2F36']],
  ['antikva', 'Antikva', 'premium', 'en-spalt', true, false, 'times', 'Times New Roman, centrerat huvud med dubbel linje', 'Formell serif', ['#7A1F2B', '#1F3A5F', '#3A3A3A', '#1E5A3C']],
  ['fasad', 'Fasad', 'premium', 'en-spalt', true, true, 'arial', 'Stort namn i versaler bakom accentkant, kvadratiskt foto', 'Stort namn, fotoplats', ['#1F3A5F', '#8A4B2A', '#1E5A3C', '#2B2F36']],
  ['raster', 'Raster', 'premium', 'en-spalt', true, false, 'verdana', 'Verdana, rubriker som tonade band, kompetenser i två spalter', 'Kompetenser i spalter', ['#0F6E6E', '#1F3A5F', '#5B2A4E', '#556B2F']],
  ['folio', 'Folio', 'premium', 'en-spalt', true, false, 'garamond', 'Garamond, högerställt huvud, kursiva rubriker', 'Elegant serif', ['#2F3E4E', '#7A1F2B', '#1E5A3C', '#8A4B2A']],
  ['stal', 'Stål', 'premium', 'sidospalt', true, false, 'calibri', 'Profil i full bredd, sedan två spalter med accentlinjer', 'Två spalter, mer plats', ['#1F3A5F', '#0F6E6E', '#8A4B2A', '#2B2F36']],
  ['morkrum', 'Mörkrum', 'premium', 'konstnarlig', false, true, 'poppins', 'Nästan svart huvudblock med rund fotoplats', 'Mörkt huvud, foto', ['#E8B07A', '#9FD3C7', '#F2A7A7', '#C9C3F5']],
  ['terrakotta', 'Terrakotta', 'premium', 'konstnarlig', false, false, 'lato', 'Krämfärgad sida, roströda rubriker, kompetenser som brickor', 'Varm tonad sida', ['#A24A2B', '#6B5B2E', '#4F6A3A', '#5B2A4E']],
  ['kvadrat', 'Kvadrat', 'premium', 'konstnarlig', false, false, 'poppins', 'Rutnät, namnet i en färgad kvadrat', 'Rutnät och färgblock', ['#3B3F8F', '#1E5A3C', '#8A4B2A', '#2B2F36']],
  ['siluett', 'Siluett', 'premium', 'konstnarlig', false, true, 'lato', 'Stor rund fotoplats centrerad, lätt namn, centrerade rubriker', 'Fotot i centrum', ['#8C4A5A', '#3B5A78', '#4F6A3A', '#3A3A3A']],
  ['ritning', 'Ritning', 'premium', 'konstnarlig', false, false, 'roboto', 'Djupblå vänsterspalt i hela sidans höjd', 'Djupblå sidospalt', ['#123B6D', '#1E5A3C', '#2B2F36', '#5B2A4E']],
  ['tidning', 'Tidning', 'premium', 'konstnarlig', false, false, 'georgia', 'Namnet som tidningshuvud, profilen i två spalter', 'Tidningshuvud', ['#9B1B1B', '#1F3A5F', '#1A1A1A', '#1E5A3C']],
  ['tusch', 'Tusch', 'premium', 'konstnarlig', false, false, 'roboto', 'Monokrom, startåren stora och ljusgrå i marginalen', 'Stora årtal', ['#1A1A1A', '#1F3A5F', '#7A1F2B', '#1E5A3C']],
  ['horisont', 'Horisont', 'premium', 'konstnarlig', false, false, 'open-sans', 'Tidsaxel under huvudet med en punkt per anställning', 'Tidsaxel under huvudet', ['#1B5E8A', '#1E5A3C', '#8A4B2A', '#5B2A4E']],
]

/**
 * Merförsäljningens kort utan foto (utbudsspecen avsnitt 6): Kalksten och
 * Granit med specens ord, övriga fotomallar med fotoledet struket. Siluett
 * saknas: hela kortet handlar om fotot.
 */
const KORT_UTAN_FOTO: Record<string, string> = {
  bjork: 'Centrerad',
  koppar: 'Färgat huvud',
  kalksten: 'Ljus sidospalt',
  granit: 'Mörk sidospalt, vit text',
  fasad: 'Stort namn',
  morkrum: 'Mörkt huvud',
}

/** Katalogen i visningsordning. */
export const MALL_KATALOG: readonly MallKort[] = RADER.map(([id, namn, niva, familj, word, foto, typsnitt, stil, kort, accenter]) => ({
  id,
  namn,
  niva,
  familj,
  stil,
  kort,
  ...(KORT_UTAN_FOTO[id] ? { kortUtanFoto: KORT_UTAN_FOTO[id] } : {}),
  word,
  foto,
  accenter,
  typsnitt,
  bild: mallBild(id),
}))

/** Kortet för ett id i katalogen, eller undefined (alias löses inte här, se alias.ts). */
export function getMallKort(id: unknown): MallKort | undefined {
  return typeof id === 'string' ? MALL_KATALOG.find((m) => m.id === id) : undefined
}

/** Finns id:t i katalogen? (Gamla id: lös dem först med losMallId.) */
export function arMallId(id: unknown): boolean {
  return getMallKort(id) !== undefined
}

/** Kortfälten en definition hämtar ur katalogen. */
export function franKatalog(id: string): MallKortFalt {
  const k = getMallKort(id)
  if (!k) throw new Error(`Mallen ${id} saknas i katalogen`)
  const { namn, niva, familj, stil, kort, word, accenter } = k
  return { id, namn, niva, familj, stil, kort, word, accenter: accenter as MallKortFalt['accenter'] }
}

/** Mallen som väljs när inget annat är valt: den första gratismallen. */
export const FORVALD_MALL_ID: string = MALL_KATALOG.find((m) => m.niva === 'gratis')!.id

export const GRATIS_MALL_IDS: readonly string[] = MALL_KATALOG.filter((m) => m.niva === 'gratis').map((m) => m.id)
export const WORD_MALL_IDS: readonly string[] = MALL_KATALOG.filter((m) => m.word).map((m) => m.id)

/** Finns mallen som Word-fil? Klientsäker. */
export function harWord(id: unknown): boolean {
  return getMallKort(id)?.word === true
}

/** Ingår mallen i gratisnivån? */
export function arGratisMall(id: unknown): boolean {
  return getMallKort(id)?.niva === 'gratis'
}

/** Antalen. Texter skriver talen härifrån (via template-antal.ts), aldrig som siffra. */
export const MALL_ANTAL = MALL_KATALOG.length
export const GRATIS_ANTAL = GRATIS_MALL_IDS.length
export const PREMIUM_ANTAL = MALL_ANTAL - GRATIS_ANTAL
export const WORD_ANTAL = WORD_MALL_IDS.length
