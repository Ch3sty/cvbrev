/**
 * Validering av personlighetsprovets begäran
 * (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 5, punkt 1).
 *
 * Klientsäker och ren, så att den går att testa utan server: token ett
 * uuid, exakt tjugo svar, alla id i banken, inga dubbletter, värden 1 till 5.
 */

import { ANTAL_PASTAENDEN, arSkalVarde, arSmakprovId, type SkalVarde, type SmakprovId } from './smakprov-pastaenden'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function arUuid(v: unknown): v is string {
  return typeof v === 'string' && UUID.test(v)
}

export interface GiltigBegaran {
  token: string
  answers: Array<{ id: SmakprovId; value: SkalVarde }>
  slug: string | null
}

export function validerBegaran(body: unknown): GiltigBegaran | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (!arUuid(b.token)) return null
  if (!Array.isArray(b.answers) || b.answers.length !== ANTAL_PASTAENDEN) return null

  const sedda = new Set<string>()
  const answers: GiltigBegaran['answers'] = []
  for (const a of b.answers) {
    if (!a || typeof a !== 'object') return null
    const { id, value } = a as Record<string, unknown>
    if (!arSmakprovId(id) || !arSkalVarde(value)) return null
    if (sedda.has(id)) return null
    sedda.add(id)
    answers.push({ id, value })
  }

  const slug = typeof b.slug === 'string' && b.slug.length > 0 ? b.slug.slice(0, 120) : null
  return { token: b.token.toLowerCase(), answers, slug }
}
