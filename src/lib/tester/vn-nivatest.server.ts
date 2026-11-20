/**
 * Nivåtestens uppgifter för Ord och text och Siffror och tabeller, byggda på
 * servern (plan-testflode-2026-11-20 etapp 2, avsnitt 11 Prestanda):
 * "verbalt och numeriskt får uppgifterna i startsvaret så bankerna lämnar
 * klientbundeln".
 *
 * Urvalet är oförändrat: samma selectPassagesForSession med sessionens id
 * och underlagsversion som TestRunner gav testvyn i klienten (numeriskt
 * expert utan version, som förut). Klienten får texten, underlaget,
 * påståendena och alternativen i samma ordning, utan facit. Genomgången
 * (rätt svar och förklaringen) byggs först när sessionen är rättad.
 *
 * Rättningen ligger kvar i answer- och complete-routerna.
 */
import 'server-only'
import { selectPassagesForSession as verbalGrund } from '@/lib/verbalTestV1/selectPassages.v1'
import { selectPassagesForSession as verbalAvancerad } from '@/lib/verbalTestV2/selectPassages.v2'
import { selectPassagesForSession as verbalExpert } from '@/lib/verbalTestExpert/selectPassages'
import { selectPassagesForSession as numGrund } from '@/lib/numericalTest/selectPassages'
import { selectPassagesForSession as numAvancerad } from '@/lib/numericalTestV2/selectPassages'
import { selectPassagesForSession as numExpert } from '@/lib/numericalTestExpert/selectPassages'
import type { Passage as NumPassage } from '@/lib/numericalTest/types'
import { underlagsVersion, type UnderlagVersion } from './underlagVersion'
import { vnFacitData } from './pass-bank.server'
import type { VnFacitData } from './pass-typer'
import {
  sparadeVnSvar,
  VN_TRE,
  type VnGenomgangPunkt,
  type VnNivatestGenomgang,
  type VnNivatestInnehall,
  type VnVisadUppgift,
  type VnVisatUnderlag,
} from './vn-nivatest'

interface VerbalPassage {
  id: string
  title: string
  topic: string
  text: string
  statements: { text: string; correctAnswer: string; explanation?: string; stod?: string[]; narmast?: string }[]
}

type Urval =
  | { form: 'verbal'; valj: (id: string, v: UnderlagVersion) => VerbalPassage[] }
  | { form: 'argument' | 'siffror'; valj: (id: string, v: UnderlagVersion) => NumPassage[] }

const URVAL: Record<string, Urval> = {
  'verbal-resonemang': { form: 'verbal', valj: (id, v) => verbalGrund(id, undefined, v) as unknown as VerbalPassage[] },
  'verbal-resonemang-v2': { form: 'verbal', valj: (id, v) => verbalAvancerad(id, undefined, v) as unknown as VerbalPassage[] },
  'verbal-resonemang-expert': { form: 'argument', valj: (id, v) => verbalExpert(id, undefined, v) },
  'numeriskt-test': { form: 'siffror', valj: (id, v) => numGrund(id, undefined, v) },
  'numeriskt-test-v2': { form: 'siffror', valj: (id, v) => numAvancerad(id, undefined, v) as unknown as NumPassage[] },
  // Numeriskt expert har bara en version (som TestRunner förut).
  'numeriskt-test-expert': { form: 'siffror', valj: (id) => numExpert(id) as unknown as NumPassage[] },
}

/** Slugarna som går genom servern; övriga får null. */
export function arVnNivatestSlug(slug: string): boolean {
  return slug in URVAL
}

interface Facit {
  ratt: string
  forklaring: string | null
  vnFacit: VnFacitData | null
}

function bygg(slug: string, sessionId: string, meta: unknown): { innehall: VnNivatestInnehall; facit: Map<string, Facit> } | null {
  const u = URVAL[slug]
  if (!u) return null
  const version = underlagsVersion(meta)
  const underlag: Record<string, VnVisatUnderlag> = {}
  const uppgifter: VnVisadUppgift[] = []
  const facit = new Map<string, Facit>()
  if (u.form === 'verbal') {
    for (const p of u.valj(sessionId, version)) {
      underlag[p.id] = { id: p.id, typ: 'text', titel: p.title, amne: p.topic ?? null, text: p.text }
      p.statements.forEach((s, i) => {
        const nyckel = `${p.id}:${i}`
        uppgifter.push({
          nyckel,
          del: p.id,
          punkt: String(i),
          text: s.text,
          alternativ: VN_TRE.map((a) => ({ id: a.id, text: a.text })),
          form: 'tre',
          iDel: i + 1,
          delAntal: p.statements.length,
        })
        facit.set(nyckel, { ratt: s.correctAnswer, forklaring: s.explanation ?? null, vnFacit: vnFacitData(s) })
      })
    }
  } else {
    for (const p of u.valj(sessionId, version)) {
      underlag[p.id] =
        u.form === 'argument'
          ? { id: p.id, typ: 'argument', titel: p.title, amne: p.topic ?? null, text: p.contextText }
          : {
              id: p.id,
              typ: 'siffror',
              titel: p.title,
              amne: p.topic ?? null,
              kontext: p.contextText || null,
              tabell: p.dataTable ?? null,
              diagram: p.chartData ?? null,
            }
      p.questions.forEach((q, i) => {
        uppgifter.push({
          nyckel: q.id,
          del: p.id,
          punkt: q.id,
          text: q.questionText,
          alternativ: q.options.map((o) => ({ id: o.id, text: o.text })),
          form: 'rader',
          iDel: i + 1,
          delAntal: p.questions.length,
        })
        facit.set(q.id, { ratt: q.correctAnswerId, forklaring: q.explanation ?? null, vnFacit: vnFacitData(q) })
      })
    }
  }
  return { innehall: { underlag, uppgifter }, facit }
}

/** Uppgifterna utan facit, i testvyns ordning. Null för okänd slug eller fel. */
export function vnInnehall(slug: string, sessionId: string, meta: unknown): VnNivatestInnehall | null {
  try {
    return bygg(slug, sessionId, meta)?.innehall ?? null
  } catch (e) {
    console.error('Nivåtestet: kunde inte bygga uppgifterna', slug, e)
    return null
  }
}

/** Genomgången efter rättningen: uppgifterna, rätt svar, förklaringen och hennes svar. */
export function vnGenomgang(slug: string, sessionId: string, meta: unknown, answers: unknown): VnNivatestGenomgang | null {
  try {
    const b = bygg(slug, sessionId, meta)
    if (!b) return null
    const sparade = sparadeVnSvar(answers, b.innehall.uppgifter)
    const punkter: VnGenomgangPunkt[] = b.innehall.uppgifter.map((u) => {
      const f = b.facit.get(u.nyckel)
      const s = sparade.get(u.nyckel)
      return { nyckel: u.nyckel, ratt: f?.ratt ?? '', forklaring: f?.forklaring ?? null, valt: s?.varde ?? null, tid_s: s?.tid_s ?? null, ...(f?.vnFacit ? { vnFacit: f.vnFacit } : {}) }
    })
    return { ...b.innehall, punkter }
  } catch (e) {
    console.error('Nivåtestet: kunde inte bygga genomgången', slug, e)
    return null
  }
}
