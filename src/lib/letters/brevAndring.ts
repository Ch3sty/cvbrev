/**
 * Ändringar av ett sparat brev utan AI (PUT /api/letters/[id]).
 *
 * Stycken, hälsning, mall, typsnitt, titel, företag, tjänst och mottagare
 * ändras utan AI och utan att dra kvot. Gamla brev flyttas till det nya
 * formatet vid första ändringen: styckena läses ur content och brevet får
 * en mall (BYGGSPEC avsnitt 3 och 7).
 *
 * Ren: validering och sammanslagning, inga anrop.
 */
import { arBrevTypsnitt, brevMallId } from './brevRegler'
import { MAX_TECKEN_HALSNING, lasSparadeStycken, styckenFranContent, tolkaStycken } from './stycken'

const MAX_FALT = 300

export interface BrevAndring {
  body_stycken?: string[]
  halsning?: string | null
  mall_id?: string
  font_id?: string | null
  title?: string | null
  company?: string | null
  job_title?: string | null
  mottagare_person?: string | null
  /** Äldre klienter (redigeringssidan före etapp 2) skickar färdig HTML. */
  content?: string
  is_saved?: boolean
}

export type TolkatResultat = { ok: true; andring: BrevAndring } | { ok: false; fel: string; falt: string }

function textFalt(v: unknown, max = MAX_FALT): string | null | undefined | false {
  if (v === undefined) return undefined
  if (v === null) return null
  if (typeof v !== 'string') return false
  const t = v.replace(/\s+/g, ' ').trim()
  if (t.length > max) return false
  return t ? t : null
}

/**
 * Tolkar en PUT-kropp. Okända fält ignoreras (förr spreds hela kroppen in i
 * update, nu bara det som får ändras). `stycken` och `body_stycken` är samma fält.
 */
export function tolkaBrevAndring(body: unknown): TolkatResultat {
  if (!body || typeof body !== 'object') return { ok: false, fel: 'Ogiltig begäran', falt: 'body' }
  const b = body as Record<string, unknown>
  const andring: BrevAndring = {}

  const styckenIn = b.stycken !== undefined ? b.stycken : b.body_stycken
  if (styckenIn !== undefined) {
    const stycken = tolkaStycken(styckenIn)
    if (!stycken) return { ok: false, fel: 'Styckena kunde inte läsas', falt: 'stycken' }
    andring.body_stycken = stycken
  }

  const halsning = textFalt(b.halsning, MAX_TECKEN_HALSNING)
  if (halsning === false) return { ok: false, fel: 'Hälsningen kunde inte läsas', falt: 'halsning' }
  if (halsning !== undefined) andring.halsning = halsning

  if (b.mall_id !== undefined) {
    const mall = brevMallId(b.mall_id)
    if (!mall) return { ok: false, fel: 'Okänd mall', falt: 'mall_id' }
    andring.mall_id = mall
  }

  if (b.font_id !== undefined) {
    if (b.font_id === null || b.font_id === '') andring.font_id = null
    else if (arBrevTypsnitt(b.font_id)) andring.font_id = b.font_id
    else return { ok: false, fel: 'Okänt typsnitt', falt: 'font_id' }
  }

  for (const falt of ['title', 'company', 'job_title', 'mottagare_person'] as const) {
    const v = textFalt(b[falt])
    if (v === false) return { ok: false, fel: 'Fältet kunde inte läsas', falt }
    if (v !== undefined) andring[falt] = v
  }

  if (b.content !== undefined) {
    if (typeof b.content !== 'string' || !b.content.trim()) return { ok: false, fel: 'Brevinnehåll krävs', falt: 'content' }
    andring.content = b.content
  }

  if (b.is_saved !== undefined) {
    if (typeof b.is_saved !== 'boolean') return { ok: false, fel: 'Ogiltigt värde', falt: 'is_saved' }
    andring.is_saved = b.is_saved
  }

  return { ok: true, andring }
}

/** Raden efter ändringen: radens fält, med ändringens fält ovanpå (kan vara null från databasen). */
export type Sammanslagen<T> = Omit<T, keyof BrevAndring> & { [K in keyof BrevAndring]?: BrevAndring[K] | null }

export interface BrevRadForAndring {
  body_stycken?: unknown
  content?: string | null
  mall_id?: string | null
  font_id?: string | null
}

/** Ändrar ändringen det som syns på arket (och därmed content)? */
export function andrarArket(a: BrevAndring): boolean {
  return (
    a.body_stycken !== undefined ||
    a.halsning !== undefined ||
    a.mall_id !== undefined ||
    a.font_id !== undefined ||
    a.company !== undefined ||
    a.job_title !== undefined ||
    a.mottagare_person !== undefined
  )
}

/**
 * Raden efter ändringen, med flytten till det nya formatet: saknar brevet
 * body_stycken läses de ur content, och saknar det mall_id får det
 * `startmall` (CV:ts mall eller Linne, se brevRegler.startmallForBrev).
 *
 * En äldre klient som skickar content (utan stycken) på ett brev i nytt
 * format: styckena läses ur den nya HTML:en, så källan och content inte
 * glider isär. På ett gammalt brev sparas content som förut.
 */
export function slaIhopAndring<T extends BrevRadForAndring>(
  rad: T,
  andring: BrevAndring,
  startmall: string
): { rad: Sammanslagen<T>; ritaOm: boolean } {
  const ny = { ...rad, ...andring } as Sammanslagen<T>
  const nyttFormat = !!rad.mall_id || andrarArket(andring)

  if (andring.content !== undefined && andring.body_stycken === undefined) {
    if (rad.mall_id) {
      ny.body_stycken = styckenFranContent(andring.content)
      return { rad: ny, ritaOm: true }
    }
    // Gammalt brev, gammal klient: HTML:en sparas som den kom, som förut.
    return { rad: ny, ritaOm: false }
  }

  if (!nyttFormat) return { rad: ny, ritaOm: false }

  if (andring.body_stycken === undefined && lasSparadeStycken(rad.body_stycken) === null) {
    ny.body_stycken = styckenFranContent(rad.content)
  }
  if (!ny.mall_id) ny.mall_id = startmall
  return { rad: ny, ritaOm: true }
}
