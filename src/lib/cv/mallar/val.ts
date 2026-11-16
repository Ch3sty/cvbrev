/**
 * MallVal ur ett anrop: rutternas body (`val`) och exempel-API:ts query.
 * Allt som inte går att lita på faller bort, så att renderaren bara ser
 * giltiga val. Klientsäker.
 */
import { arUppsattning, rensaRubriker } from '../rubriker'
import type { MallVal, Ordning, TypsnittId } from './kontrakt'

const ORDNINGAR: readonly Ordning[] = ['standard', 'intyg', 'utbildning', 'kompetenser']

export const TYPSNITT_IDS: readonly TypsnittId[] = [
  'calibri',
  'arial',
  'verdana',
  'georgia',
  'garamond',
  'times',
  'lato',
  'open-sans',
  'roboto',
  'poppins',
  'helvetica',
]

export function arTypsnitt(id: unknown): id is TypsnittId {
  return typeof id === 'string' && (TYPSNITT_IDS as readonly string[]).includes(id)
}

export function arOrdning(id: unknown): id is Ordning {
  return typeof id === 'string' && (ORDNINGAR as readonly string[]).includes(id)
}

const sant = (v: unknown) => v === true || v === 'true' || v === '1' || v === 1

/**
 * Valen ur ett objekt (body.val). Äldre fält i samma body tas med som
 * reserv: `templateOptions.includePhoto` blir foto, `fontId` typsnitt.
 */
export function tolkaVal(indata: unknown, aldre: { includePhoto?: unknown; fontId?: unknown } = {}): MallVal {
  const v = (indata && typeof indata === 'object' && !Array.isArray(indata) ? indata : {}) as Record<string, unknown>
  const val: MallVal = {}
  if (arOrdning(v.ordning)) val.ordning = v.ordning
  if (v.enSida !== undefined) val.enSida = sant(v.enSida)
  const farg = typeof v.farg === 'string' ? Number(v.farg) : v.farg
  if (typeof farg === 'number' && Number.isInteger(farg) && farg >= 0 && farg <= 3) val.farg = farg
  if (arTypsnitt(v.typsnitt)) val.typsnitt = v.typsnitt
  else if (arTypsnitt(aldre.fontId)) val.typsnitt = aldre.fontId
  if (v.foto !== undefined) val.foto = sant(v.foto)
  else if (aldre.includePhoto !== undefined) val.foto = sant(aldre.includePhoto)
  const rubriker = rensaRubriker(v.rubriker)
  if (Object.keys(rubriker).length) val.rubriker = rubriker
  if (arUppsattning(v.uppsattning)) val.uppsattning = v.uppsattning
  return val
}

/**
 * Valen ur en query (exempel-API:t): `typsnitt`, `farg`, `ordning`,
 * `foto`, `ensida`, och `rubriker` eller `uppsattning` (båda betyder en
 * uppsättning; `rubriker` kan också vara JSON med valda rubriker).
 */
export function tolkaValUrQuery(q: URLSearchParams): MallVal {
  const rubriker = q.get('rubriker')
  let valda: unknown
  let uppsattning = q.get('uppsattning') ?? undefined
  if (rubriker) {
    if (rubriker.trim().startsWith('{')) {
      try {
        valda = JSON.parse(rubriker)
      } catch {
        valda = undefined
      }
    } else uppsattning = uppsattning ?? rubriker
  }
  return tolkaVal({
    typsnitt: q.get('typsnitt') ?? undefined,
    farg: q.get('farg') ?? undefined,
    ordning: q.get('ordning') ?? undefined,
    foto: q.get('foto') ?? undefined,
    enSida: q.get('ensida') ?? undefined,
    rubriker: valda,
    uppsattning,
  })
}

/**
 * Typsnittets id ur en CSS-stack ("'Open Sans', Arial, sans-serif" blir
 * open-sans). Äldre klienter skickar bara stacken.
 */
export function typsnittIdForFamilj(familj: unknown): TypsnittId | undefined {
  if (typeof familj !== 'string') return undefined
  const forsta = familj.split(',')[0].replace(/['"]/g, '').trim().toLowerCase()
  const id = forsta === 'times new roman' ? 'times' : forsta.replace(/\s+/g, '-')
  return arTypsnitt(id) ? id : undefined
}
