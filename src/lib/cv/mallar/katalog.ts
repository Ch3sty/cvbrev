/**
 * Mallkatalogen: det komponenterna vet om varje mall (MallKort i
 * kontrakt.ts), i visningsordning, gratismallarna först.
 *
 * Klientsäker och liten: ren data. Den drar inte in renderaren, registret
 * eller någon CSS (komponenternas JS-budget, plan avsnitt 6). Definitionerna
 * (definitioner/*.ts) hämtar sina kortfält härifrån med `franKatalog`, och
 * testet i __tests__/mallsystemet.test.ts fäller om katalogen och registret
 * glider isär.
 */
import type { MallKort } from './kontrakt'
import type { MallKortFalt } from './typer'

/** Miniatyrernas sökvägar (scripts/mallbilder.ts skriver dem). */
export function mallBild(id: string): MallKort['bild'] {
  return { liten: `/mallar/v2/${id}-liten.webp`, stor: `/mallar/v2/${id}-stor.webp` }
}

/**
 * Katalogen. PROVISORISK: två provmallar tills art-directorns utbud är byggt
 * (docs/design/mallar-utbud-2026-11-16.md). De når aldrig main.
 */
export const MALL_KATALOG: readonly MallKort[] = [
  {
    id: 'prov-enspalt',
    namn: 'Prov enspalt',
    niva: 'gratis',
    familj: 'en-spalt',
    stil: 'Vänsterställt namn, tunna linjer',
    kort: 'Provisorisk enspaltig',
    word: true,
    foto: false,
    accenter: ['#1f4e79', '#2f6b4f', '#7a2e3a', '#3d3d3d'],
    typsnitt: 'calibri',
    bild: mallBild('prov-enspalt'),
  },
  {
    id: 'prov-sidospalt',
    namn: 'Prov sidospalt',
    niva: 'gratis',
    familj: 'sidospalt',
    stil: 'Tonad sidospalt med foto',
    kort: 'Provisorisk sidospalt',
    word: true,
    foto: true,
    accenter: ['#0f5c63', '#5b3f8c', '#9a4a1c', '#2b4c7e'],
    typsnitt: 'arial',
    bild: mallBild('prov-sidospalt'),
  },
]

/** Mallens id, eller undefined om det inte finns i katalogen (alias löses inte här, se alias.ts). */
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
