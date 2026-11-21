/**
 * Brevets stycken som ren text (BYGGSPEC avsnitt 3).
 *
 * body_stycken är källan för brevet. Gamla brev har bara content (färdig
 * HTML i en av de sex gamla mallarna, eller ren text från det publika
 * utkastet), och deras stycken läses ut lat, först när brevet öppnas för
 * ändring eller mallbyte.
 *
 * Klientsäker och ren: inga sidoeffekter.
 */
import { extractEditableContent } from './extract-editable-content'

/** Högsta antal stycken och tecken per stycke som servern tar emot. */
export const MAX_STYCKEN = 20
export const MAX_TECKEN_PER_STYCKE = 4000
export const MAX_TECKEN_HALSNING = 200

/** Blanksteg i ett stycke: radbrytningar och dubbla mellanslag blir ett mellanslag. */
export function rensaStycke(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/**
 * Delar en brödtext i stycken. Tomma rader skiljer stycken; finns inga tomma
 * rader men flera rader, är varje rad ett stycke (så skrev modellen och de
 * gamla mallarna). Markdown-fetstil som modellen ibland lägger till tas bort.
 */
export function styckenFranText(text: string | null | undefined): string[] {
  if (!text) return []
  const ren = text.replace(/\r\n?/g, '\n').replace(/\*\*(.+?)\*\*/g, '$1').trim()
  if (!ren) return []
  const delar = /\n\s*\n/.test(ren) ? ren.split(/\n\s*\n/) : ren.split('\n')
  return delar.map(rensaStycke).filter((s) => s.length > 0)
}

function avkodaEntiteter(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
}

const BREVMALL_STYCKE = /<p\b[^>]*\bdata-stycke="\d+"[^>]*>([\s\S]*?)<\/p>/g

/**
 * Styckena ur brevmallens HTML (src/lib/letters/brevmall): varje stycke är
 * ett element med data-stycke. Markeringar och skrivmarkören tas bort, och
 * entiteterna avkodas, så att texten blir den som ritades. Null om HTML:en
 * inte kommer från brevmallen.
 */
export function styckenFranBrevmall(html: string): string[] | null {
  if (!html.includes('data-stycke=')) return null
  const ut: string[] = []
  for (const m of html.matchAll(BREVMALL_STYCKE)) {
    const text = rensaStycke(avkodaEntiteter(m[1].replace(/<[^>]*>/g, '')))
    if (text) ut.push(text)
  }
  return ut
}

/**
 * Styckena ur ett brevs content. Brevmallens HTML: elementen med
 * data-stycke. De gamla mallarnas HTML: div.body-content via
 * extractEditableContent. Ren text (det publika utkastet): delas som den är.
 */
export function styckenFranContent(content: string | null | undefined): string[] {
  if (!content) return []
  return styckenFranBrevmall(content) ?? styckenFranText(extractEditableContent(content))
}

/**
 * Validerar stycken från en klient. Ger null när indata inte är en lista med
 * strängar inom gränserna; tomma stycken tas bort.
 */
export function tolkaStycken(indata: unknown): string[] | null {
  if (!Array.isArray(indata)) return null
  if (indata.length > MAX_STYCKEN) return null
  const ut: string[] = []
  for (const s of indata) {
    if (typeof s !== 'string') return null
    if (s.length > MAX_TECKEN_PER_STYCKE) return null
    const t = rensaStycke(s)
    if (t) ut.push(t)
  }
  return ut
}

/** Styckena ur en sparad rad (jsonb), eller null om kolumnen är tom eller trasig. */
export function lasSparadeStycken(varde: unknown): string[] | null {
  if (!Array.isArray(varde)) return null
  return varde.filter((s): s is string => typeof s === 'string')
}

/** Brevets stycken: sparade i första hand, annars utlästa ur content. */
export function styckenForBrev(letter: { body_stycken?: unknown; content?: string | null }): string[] {
  return lasSparadeStycken(letter.body_stycken) ?? styckenFranContent(letter.content)
}

/** Ordantal i styckena (hälsning och avslut räknas inte). */
export function raknaOrd(stycken: readonly string[]): number {
  let n = 0
  for (const s of stycken) {
    const ord = s.trim().split(/\s+/).filter((o) => /[\p{L}\p{N}]/u.test(o))
    n += ord.length
  }
  return n
}

/** Hälsningens förval efter språk, när halsning är null. */
export function forvaldHalsning(sprak: 'sv' | 'en'): string {
  return sprak === 'en' ? 'Dear Hiring Manager,' : 'Hej,'
}

/** Avslutet efter språk (BYGGSPEC avsnitt 5). */
export function avslut(sprak: 'sv' | 'en'): string {
  return sprak === 'en' ? 'Kind regards' : 'Med vänlig hälsning'
}

/**
 * Brevet som ren text att kopiera: hälsning, stycken, avslut och namn
 * (BYGGSPEC avsnitt 7, foten "Kopiera text").
 */
export function brevSomText(data: {
  halsning: string | null
  stycken: readonly string[]
  sprak: 'sv' | 'en'
  avsandare: { namn: string }
}): string {
  const delar = [data.halsning?.trim() || forvaldHalsning(data.sprak), ...data.stycken, `${avslut(data.sprak)}\n${data.avsandare.namn}`.trim()]
  return delar.filter((d) => d.trim().length > 0).join('\n\n')
}
