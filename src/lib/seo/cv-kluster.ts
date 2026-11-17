/**
 * Titlar och beskrivningar för CV-klustret (docs/plan-seo-cv-kluster-2026-11-17.md,
 * B3, B5 och B6). Reglerna står på ett ställe så att testet
 * (src/lib/seo/__tests__/cv-kluster.test.ts) mäter samma text som sidorna
 * skriver: title högst 60 tecken, description 110 till 158, inga tankstreck,
 * talen ur katalogen.
 */
import { FREE_TEMPLATE_COUNT, TEMPLATE_COUNT, WORD_TEMPLATE_COUNT } from '@/lib/cv/template-antal'
import { MALL_KATALOG } from '@/lib/cv/mallar/katalog'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'

export const TITEL_MAX = 60
export const BESKRIVNING_MIN = 110
export const BESKRIVNING_MAX = 158

/** Första kandidaten som ryms, annars den sista. */
function forstaSomRyms(kandidater: string[], max: number): string {
  return kandidater.find((k) => k.length <= max) ?? kandidater[kandidater.length - 1]
}

/**
 * Yrket i löptext: gemener, men förkortningar står kvar (IT-tekniker,
 * LSS-handläggare, projektledare IT).
 */
export function yrkeILopptext(yrke: string): string {
  return yrke
    .split(/([\s-]+)/)
    .map((del) => (/^[A-ZÅÄÖ]{2,}$/.test(del) ? del : del.toLowerCase()))
    .join('')
}

// ── /cv-mallar/[yrke] (B6) ─────────────────────────────────────────────

export function yrkesmallTitel(namnBestamd: string): string {
  return forstaSomRyms(
    [
      `CV-mall för ${namnBestamd}: välj mall och fyll i, ${FREE_TEMPLATE_COUNT} gratis`,
      `CV-mall för ${namnBestamd}, ${FREE_TEMPLATE_COUNT} gratis`,
      `CV-mall för ${namnBestamd}`,
    ],
    TITEL_MAX,
  )
}

export function yrkesmallBeskrivning(namnBestamd: string): string {
  const bas = `CV-mall för ${namnBestamd} med rubriker för yrket: ${TEMPLATE_COUNT} mallar som läses rätt av rekryteringssystem, ${FREE_TEMPLATE_COUNT} gratis som PDF eller Word.`
  return forstaSomRyms([`${bas} Se vad rekryterare letar efter.`, bas], BESKRIVNING_MAX)
}

// ── /cv-exempel/[yrke] (B6) och piloten (B3) ───────────────────────────

export function exempelTitel(yrke: string): string {
  const y = yrkeILopptext(yrke)
  return forstaSomRyms([`CV-exempel ${y}: färdigt CV att utgå från`, `CV-exempel ${y}: färdigt CV`], TITEL_MAX)
}

export function pilotTitel(yrke: string): string {
  return `CV för ${yrkeILopptext(yrke)}: exempel och mall att fylla i`
}

export function pilotBeskrivning(yrke: string): string {
  const y = yrkeILopptext(yrke)
  const svans = 'Se vad rekryterare letar efter, välj mall och ladda ner gratis som PDF eller Word.'
  return forstaSomRyms(
    [`Färdigt CV-exempel för ${y} och mallar att fylla i. ${svans}`, `CV-exempel för ${y} och mallar att fylla i. ${svans}`],
    BESKRIVNING_MAX,
  )
}

// ── Stilsidorna (B5) ───────────────────────────────────────────────────

export type Stil = 'word' | 'foto' | 'enkla'

/** Mallarna med egenskapen, i katalogens ordning (gratismallarna först). */
export function stilMallar(stil: Stil): readonly MallKort[] {
  if (stil === 'word') return MALL_KATALOG.filter((m) => m.word)
  if (stil === 'foto') return MALL_KATALOG.filter((m) => m.foto)
  return MALL_KATALOG.filter((m) => m.familj === 'en-spalt')
}

export const ANTAL_FOTO = stilMallar('foto').length
export const ANTAL_EN_SPALT = stilMallar('enkla').length
export const ANTAL_FOTO_MED_WORD = stilMallar('foto').filter((m) => m.word).length

export const STIL_SIDOR: Record<Stil, { path: string; titel: string; beskrivning: string; h1: string; kort: string }> = {
  word: {
    path: '/cv-mallar/word',
    titel: `CV-mall i Word: ${WORD_TEMPLATE_COUNT} mallar att fylla i och ladda ner`,
    beskrivning: `CV-mallar i Word med dina uppgifter redan på plats: ${WORD_TEMPLATE_COUNT} mallar som .docx, Linne och Björk gratis. Fyll i online, ladda ner Word-filen och ändra vidare.`,
    h1: 'CV-mallar i Word att fylla i och ladda ner',
    kort: 'CV-mallar i Word',
  },
  foto: {
    path: '/cv-mallar/foto',
    titel: `CV-mall med bild: ${ANTAL_FOTO} mallar med plats för foto`,
    beskrivning: `CV-mallar med bild: ${ANTAL_FOTO} mallar med fotoplats, Björk gratis. Fyll i CV:t online, lägg till ditt foto i kontot och ladda ner som PDF${
      ANTAL_FOTO_MED_WORD > 0 ? ' eller Word' : ''
    }.`,
    h1: 'CV-mallar med plats för bild',
    kort: 'CV-mallar med bild',
  },
  enkla: {
    path: '/cv-mallar/enkla',
    titel: `Enkel CV-mall: ${ANTAL_EN_SPALT} lugna mallar i en spalt, ${FREE_TEMPLATE_COUNT} gratis`,
    beskrivning: `Enkla CV-mallar i en spalt som rekryteringssystemen läser rätt: ${ANTAL_EN_SPALT} mallar med standardrubriker, Linne och Björk gratis som PDF eller Word.`,
    h1: 'Enkla CV-mallar i en spalt',
    kort: 'Enkla CV-mallar',
  },
}

// ── /cv-mallar (B4) och /exempel (B7) ──────────────────────────────────

export const CV_MALLAR_BESKRIVNING = `CV-mallar för svenska jobb: ${TEMPLATE_COUNT} mallar att fylla i och ladda ner som PDF eller Word, ${FREE_TEMPLATE_COUNT} av dem gratis. Ladda upp ditt CV och se det i mallarna direkt.`
