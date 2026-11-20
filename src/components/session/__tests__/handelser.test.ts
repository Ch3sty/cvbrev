// Mätningen (plan-testflode-2026-11-20 avsnitt 8): de gamla händelsenamnen
// skjuts oförändrade från samma ställen, och ramens nya skjuts bara från
// handelser.ts. Ett grep-test, som planen kräver.

import { describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const capture = vi.fn()
vi.mock('@/lib/analytics/events', () => ({ capture: (...a: unknown[]) => capture(...a) }))
const { sessionHandelser } = await import('../handelser')

const SRC = path.resolve(__dirname, '../../..')
function kallkod(rel: string): string {
  return fs.readFileSync(path.join(SRC, rel), 'utf8')
}
function allaFiler(d: string): string[] {
  return fs.readdirSync(d).flatMap((f) => {
    const p = path.join(d, f)
    if (f === 'node_modules' || f === '__tests__') return []
    return fs.statSync(p).isDirectory() ? allaFiler(p) : /\.tsx?$/.test(f) ? [p] : []
  })
}

describe('de gamla namnen skjuts som förut', () => {
  it('nivamatning_startad med samma egenskaper i figurseriernas Nivåkoll', () => {
    expect(kallkod('components/session/figurserie/FigurserieNivakoll.tsx')).toContain(
      "capture('nivamatning_startad', { ommatning: v.typ === 'ommatning', smakprov: 0, test_kind: 'figurserie' })"
    )
  })
  it('betalvagg_visad plats ommatning från väggen (också vid 402) och plats matning från köpet på resultatet (etapp 7)', () => {
    const k = kallkod('components/session/figurserie/FigurserieNivakoll.tsx')
    expect(k).toContain(`plats="ommatning" matning={{ test_kind: 'figurserie', lage: 'nivakoll' }}`)
    expect(k).toContain('betalvagg: <PaywallCard')
    expect(k).toContain('<NivakollKop testKind={vy.kind} />')
    expect(kallkod('components/session/delat/NivakollKop.tsx')).toContain(
      "capture('betalvagg_visad', { plats: 'matning', dagar_kvar: dagarKvar, test_kind: testKind, lage: 'nivakoll' })"
    )
  })
  it('övningsprovets start och betalvägg som i Startark, plus lage (etapp 7)', () => {
    const k = kallkod('components/session/figurserie/FigurserieOvningsprov.tsx')
    expect(k).toContain("capture('pass_startat', { typ: 'general', variant: 'niva' })")
    expect(k).toContain('<OvningsprovBetalvagg typ="figurer"')
    const v = kallkod('components/session/delat/OvningsprovStart.tsx')
    expect(v).toContain("capture('betalvagg_visad', { plats: 'provlage', dagar_kvar: dagarKvar, test_kind: typ, lage: 'ovningsprov', ...(fran ? { kalla: fran } : {}) })")
    expect(v).toContain("capture('paywall_cta_clicked', {")
    expect(v).toMatch(/variant: 'testniva',\s+plan: SALD_PLAN,\s+surface: 'ovningsprov',\s+cta: 'primary',\s+plats: 'provlage',/)
  })
  it('test_completed och statusradens köp ligger kvar i TestResultsPage', () => {
    const k = kallkod('components/tests/shared/TestResultsPage.tsx')
    expect(k).toContain("logUserActivity(uid, 'test_completed'")
    expect(k).toContain("capture('betalvagg_visad', { plats: 'testresultat', dagar_kvar: null, test_kind: testKind, lage: 'nivatest' })")
  })
  it('serverns namn är orörda', () => {
    for (const namn of ['pass_klart', 'nivamatning_klar', 'ommatning_klar', 'generalrepetition_klar', 'provpaket_klart']) {
      const hittad = allaFiler(path.join(SRC, 'lib')).some((f) => fs.readFileSync(f, 'utf8').includes(`'${namn}'`))
      expect(hittad, namn).toBe(true)
    }
  })
})

describe('ramens händelser skjuts bara från handelser.ts', () => {
  it('ingen typ eller annan fil skjuter test_* direkt', () => {
    const nya = ['test_start_viewed', 'test_session_started', 'test_question_answered', 'test_session_abandoned', 'test_session_completed', 'test_submit_blocked', 'traning_installning_andrad']
    for (const fil of allaFiler(SRC)) {
      if (fil.endsWith(path.join('session', 'handelser.ts')) || fil.endsWith(path.join('analytics', 'events.ts'))) continue
      const kod = fs.readFileSync(fil, 'utf8')
      for (const n of nya) expect(kod.includes(`capture('${n}'`), `${fil} skjuter ${n}`).toBe(false)
    }
  })

  it('aldrig ratt i mätlägen', () => {
    capture.mockClear()
    const bas = { test_kind: 'figurserie', niva: 'grund', format: null }
    sessionHandelser.besvarad({ ...bas, lage: 'nivatest' }, { session_id: 's', index: 0, elapsed_ms: 1, via: 'tap', vet_inte: false, ratt: true })
    sessionHandelser.besvarad({ ...bas, lage: 'trana' }, { session_id: 's', index: 0, elapsed_ms: 1, via: 'tap', vet_inte: false, ratt: true })
    expect(capture.mock.calls[0][1]).not.toHaveProperty('ratt')
    expect(capture.mock.calls[1][1]).toHaveProperty('ratt', true)
    expect(capture.mock.calls[0][0]).toBe('test_question_answered')
  })
})
