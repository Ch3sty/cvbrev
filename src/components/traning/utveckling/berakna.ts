/**
 * Rena uträkningar för Din utveckling: tempot och familjerna ur
 * träningssessionernas rader, och kurvans märke. Servern (data.server.ts)
 * läser raderna; här finns ingen databas och ingen frågebank, så att det går
 * att testa.
 */

import { lasSvar, slutfordaSessioner, type SessionRad } from '@/lib/traning/historik'
import { unikaSvar, SVARSNYCKLAR } from '@/lib/tests/sparaSvar'
import { familjestatistik, type FamiljSvar, type Familjestatistik } from '@/lib/traning/familjer'
import { dagSthlm, type Dag } from '@/lib/traning/datum'
import type { Nivapunkt } from '@/lib/traning/milstolpar'
import type { Traningsstatus } from '@/lib/traning/motor.server'
import type { UtvecklingKurva, UtvecklingTempo } from './typer'

const PASSTYPER = new Set(['pass', 'riktat', 'general'])

/**
 * Tempot: senaste passets frågor (tid och rätt, i svarsordning) och snittet
 * per pass för upp till fem pass. Snittet är meta.snitt_s, som motorn sparar
 * vid avslutet och som gäller frågorna nära nivån; äldre pass saknar det.
 */
export function byggTempo(rader: readonly SessionRad[]): UtvecklingTempo | null {
  const pass = slutfordaSessioner(rader).filter((s) => PASSTYPER.has(s.typ))
  if (pass.length === 0) return null
  const sista = pass[pass.length - 1]
  const rad = rader.find((r) => r.id === sista.id)
  const fragor = unikaSvar(lasSvar(rad?.answers), SVARSNYCKLAR.matris)
    .filter((s) => s.time_spent > 0 || s.tiden_ute)
    .map((s) => ({ tid_s: s.time_spent, ratt: s.correct }))
  return {
    senaste: fragor.length ? { dag: sista.dag, budget_s: sista.meta.budget_s, fragor } : null,
    snittPerPass: pass.slice(-5).map((s) => ({
      dag: s.dag,
      snitt_s: typeof s.meta.snitt_s === 'number' ? s.meta.snitt_s : null,
      budget_s: s.meta.budget_s,
    })),
  }
}

/**
 * Familjerna ackumulerat över alla slutförda träningssessioner, som motorns
 * familjeunderlag: rätt men långsamt är rätt svar över sessionens budget.
 * `familjFor` slår upp frågans familj i banken (servern).
 */
export function byggFamiljer(rader: readonly SessionRad[], familjFor: (qId: string) => string | null): Familjestatistik[] {
  const svar: FamiljSvar[] = []
  for (const s of slutfordaSessioner(rader)) {
    const rad = rader.find((r) => r.id === s.id)
    if (!rad) continue
    for (const a of unikaSvar(lasSvar(rad.answers), SVARSNYCKLAR.matris)) {
      const family = familjFor(a.q_id)
      if (!family) continue
      svar.push({ family, correct: a.correct, langsam: a.correct && a.time_spent > s.meta.budget_s })
    }
  }
  return familjestatistik(svar)
}

/** Familjerna med minst `minst` svar, svagast först (lägst andel, fler svar först vid lika). */
export function familjerForKortet(alla: readonly Familjestatistik[], minst = 2): Familjestatistik[] {
  return alla
    .filter((f) => f.antal >= minst)
    .sort((a, b) => a.andel - b.andel || b.antal - a.antal || a.family.localeCompare(b.family, 'sv'))
}

/** Dagen märket Nivån upp nåddes, ur test_milstolpar. */
export function nivanUppDag(milstolpar: readonly { nyckel: string; nadd_at: string }[]): Dag | null {
  const m = milstolpar.find((x) => x.nyckel === 'nivan_upp')
  return m ? dagSthlm(m.nadd_at) : null
}

/** Punkten märket står på: dagens sista punkt den dagen, annars första punkten efter. */
export function markePunkt(punkter: readonly Nivapunkt[], dag: Dag | null): Nivapunkt | null {
  if (!dag) return null
  const sorterade = [...punkter].sort((a, b) => (a.dag < b.dag ? -1 : a.dag > b.dag ? 1 : 0))
  const samma = sorterade.filter((p) => p.dag === dag)
  if (samma.length) return samma[samma.length - 1]
  return sorterade.find((p) => p.dag > dag) ?? null
}

export interface TempoSammandrag {
  antal: number
  over: number
  /** Snittid i hela sekunder på alla frågor i senaste passet. */
  snitt_s: number
  /** Index för frågor som var både fel och över tiden. */
  fastnade: number[]
}

export function tempoSammandrag(senaste: NonNullable<UtvecklingTempo['senaste']>): TempoSammandrag {
  const f = senaste.fragor
  const over = f.filter((q) => q.tid_s > senaste.budget_s).length
  const snitt = f.length ? Math.round(f.reduce((s, q) => s + q.tid_s, 0) / f.length) : 0
  const fastnade = f.map((q, i) => (!q.ratt && q.tid_s > senaste.budget_s ? i : -1)).filter((i) => i >= 0)
  return { antal: f.length, over, snitt_s: snitt, fastnade }
}

/**
 * Kurvans props ur motorns status (hamtaTraningsstatus), samma regler som
 * Helkurva: provet bara när det ligger i dag eller framåt, ingen kurva utan
 * mätning.
 */
export function kurvaUrStatus(
  s: Pick<Traningsstatus, 'start' | 'niva' | 'punkter' | 'plandagar' | 'plan' | 'dagarKvar' | 'milstolpar' | 'historikLast' | 'dagensPassGjort'> | null
): UtvecklingKurva | null {
  if (!s || !s.start || s.niva == null) return null
  const prov = s.plan?.provdatum && s.dagarKvar != null && s.dagarKvar >= 0 ? s.plan.provdatum : null
  return {
    punkter: s.punkter,
    plan: s.plandagar,
    start: s.start,
    prov,
    sikte: s.plan?.sikte ?? null,
    nivanUpp: nivanUppDag(s.milstolpar),
    historikLast: s.historikLast,
    passKvar: !s.dagensPassGjort,
  }
}
