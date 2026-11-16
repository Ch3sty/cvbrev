/**
 * Katalogen som komponenterna läser (MallKort, antalen, gratismallarna).
 *
 * TILLFÄLLIG KÄLLA: byggagent A bygger den riktiga katalogen i
 * src/lib/cv/mallar/katalog.ts (MALL_KATALOG, GRATIS_MALL_IDS, harWord,
 * MALL_ANTAL, GRATIS_ANTAL, WORD_ANTAL). Tills den finns räknas korten här
 * fram ur dagens register, med samma namn på exporterna. När A:s katalog
 * landar byts hela filen mot en omexport:
 *
 *   export * from '@/lib/cv/mallar/katalog'
 *
 * och inget annat i komponenterna behöver ändras. Ingen komponent får skriva
 * ett mallnamn, ett mall-id eller ett antal för hand; allt läses härifrån.
 *
 * Bara för servern (sidor, rutter): registret är stort. Klienten får korten
 * som props.
 */
import 'server-only'
import type { Familj, MallKort } from '@/lib/cv/mallar/kontrakt'
import { SIMPLE_TEMPLATES } from '@/lib/cv/simple-templates'
import { WORD_TEMPLATE_IDS } from '@/lib/cv/template-antal'
import { isValidTemplateId } from '@/lib/cv/templates'

/** Mallens fyra accenter tills mallomgörningen ger varje mall sina. */
const ACCENTER_FORVAL: MallKort['accenter'] = ['#E07A2F', '#1E5F8C', '#2F7D5B', '#6B3A6E']

function familjFor(t: (typeof SIMPLE_TEMPLATES)[number]): Familj {
  if (t.features?.columns === 2) return 'sidospalt'
  if (t.category === 'creative') return 'konstnarlig'
  return 'en-spalt'
}

/** Registrets beskrivning i högst fyra ord, för merförsäljningens kort. */
function kortBeskrivning(text: string): string {
  const ord = text.replace(/\s+—\s+/g, ', ').replace(/[.,].*$/, '').split(/\s+/)
  return ord.slice(0, 4).join(' ')
}

const GILTIGA = SIMPLE_TEMPLATES.filter((t) => isValidTemplateId(t.id))

/** Alla mallar i katalogens ordning: gratismallarna först. */
export const MALL_KATALOG: readonly MallKort[] = [...GILTIGA]
  .sort((a, b) => (a.tier === b.tier ? 0 : a.tier === 'free' ? -1 : 1))
  .map((t) => ({
    id: t.id,
    namn: t.name,
    niva: t.tier === 'free' ? 'gratis' : 'premium',
    familj: familjFor(t),
    stil: t.description.replace(/\s+—\s+/g, ', '),
    kort: kortBeskrivning(t.description),
    word: (WORD_TEMPLATE_IDS as readonly string[]).includes(t.id),
    foto: t.features?.supportsPhoto === true,
    accenter: ACCENTER_FORVAL,
    bild: {
      liten: t.imagePath.replace(/\.svg$/, '.webp'),
      stor: t.imagePath.replace(/\.svg$/, '.webp'),
    },
  }))

export const GRATIS_MALL_IDS: readonly string[] = MALL_KATALOG.filter((m) => m.niva === 'gratis').map((m) => m.id)
export const MALL_ANTAL = MALL_KATALOG.length
export const GRATIS_ANTAL = GRATIS_MALL_IDS.length
export const WORD_ANTAL = MALL_KATALOG.filter((m) => m.word).length

export function harWord(id: string): boolean {
  return MALL_KATALOG.some((m) => m.id === id && m.word)
}

export function mallKort(id: string | null | undefined): MallKort | undefined {
  if (!id) return undefined
  return MALL_KATALOG.find((m) => m.id === id)
}
