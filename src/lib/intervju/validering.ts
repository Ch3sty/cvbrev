/**
 * Serverns kontroll av modellsvaret i intervjuprovet
 * (docs/design/intervjuprov-spec-2026-09-23.md, avsnitt 7).
 *
 * Ren funktion utan beroenden, så att den går att testa utan Gemini.
 * Modellens text går aldrig vidare oparsad: allt som lämnar servern har
 * passerat här, och nivåetiketten sätts ur talet, aldrig av modellen.
 */

import { NIVA_ETIKETTER, type MissingKind } from '@/components/artiklar/intervjuprov/intervjuprov-copy'

export const MISSING_KINDS: readonly MissingKind[] = [
  'planen',
  'resultatet',
  'exemplet',
  'kopplingen',
  'jag-formen',
]

export type Niva = 1 | 2 | 3 | 4 | 5

export interface Punkt {
  title: string
  text: string
}

export interface Bedomning {
  level: Niva
  levelLabel: string
  summary: string
  works: string
  missing: string
  missingKind: MissingKind
  full: { points: Punkt[] }
  improvedAnswer: string
  improvedWhy: string
}

export type TolkatSvar = { relevant: false } | ({ relevant: true } & Bedomning)

/** Fel som ska bli 500 hos klienten: användaren får försöka igen. */
export class OgiltigBedomning extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OgiltigBedomning'
  }
}

export const MIN_OMSKRIVET = 300

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

/** Talstreck och tankstreck byts mot komma: vi skriver aldrig med dem. */
function utanTalstreck(s: string): string {
  return s.replace(/\s*[—–]\s*/g, ', ')
}

export function klippNiva(v: unknown): Niva {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) return 1
  return Math.min(5, Math.max(1, Math.round(n))) as Niva
}

/**
 * Tolkar och kontrollerar modellens JSON. Kastar OgiltigBedomning när ett
 * relevant svar saknar det som ska finnas bakom spärren.
 */
export function tolkaBedomning(raw: unknown): TolkatSvar {
  if (!raw || typeof raw !== 'object') {
    throw new OgiltigBedomning('Svaret är inte ett objekt')
  }
  const r = raw as Record<string, unknown>

  if (r.relevant === false) return { relevant: false }

  const level = klippNiva(r.level)
  const summary = utanTalstreck(str(r.summary))
  const works = utanTalstreck(str(r.works))
  const missing = utanTalstreck(str(r.missing))
  const improvedAnswer = utanTalstreck(str(r.improvedAnswer))
  const improvedWhy = utanTalstreck(str(r.improvedWhy))

  const kindRaw = str(r.missingKind).toLowerCase()
  const missingKind: MissingKind = (MISSING_KINDS as readonly string[]).includes(kindRaw)
    ? (kindRaw as MissingKind)
    : 'exemplet'

  const fullRaw = r.full as { points?: unknown } | undefined
  const points: Punkt[] = Array.isArray(fullRaw?.points)
    ? (fullRaw!.points as unknown[])
        .map((p) => {
          const o = (p ?? {}) as Record<string, unknown>
          return { title: utanTalstreck(str(o.title)), text: utanTalstreck(str(o.text)) }
        })
        .filter((p) => p.title && p.text)
        .slice(0, 8)
    : []

  if (!summary || !works || !missing) {
    throw new OgiltigBedomning('Bedömningen saknar summary, works eller missing')
  }
  if (points.length === 0) {
    throw new OgiltigBedomning('full.points är tom')
  }
  if (improvedAnswer.length < MIN_OMSKRIVET) {
    throw new OgiltigBedomning(`improvedAnswer är ${improvedAnswer.length} tecken, minst ${MIN_OMSKRIVET}`)
  }

  return {
    relevant: true,
    level,
    levelLabel: NIVA_ETIKETTER[level],
    summary,
    works,
    missing,
    missingKind,
    full: { points },
    improvedAnswer,
    improvedWhy,
  }
}

/** Antal platshållarrader för det omskrivna svaret: en per 70 tecken, 4 till 8. */
export function omskrivetRader(improvedAnswer: string): number {
  return Math.min(8, Math.max(4, Math.ceil(improvedAnswer.length / 70)))
}

/** Validering av begäran. Returnerar felkoden, eller null när texten duger. */
export function kontrolleraSvarslangd(
  answer: string,
  min = 200,
  max = 1200
): 'too_short' | 'too_long' | null {
  const n = answer.trim().length
  if (n < min) return 'too_short'
  if (n > max) return 'too_long'
  return null
}
