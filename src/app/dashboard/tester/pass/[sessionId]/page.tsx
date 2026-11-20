/**
 * En träningssession (våg 3b): återupptar ett pass, en mätning eller en
 * generalrepetition där den står, eller visar genomgången när den redan är
 * avslutad. Sessionen läses här, så att frågan målas ur första HTML
 * (prestandabudgeten för flöden, LCP under 2,0 s).
 */

import { notFound } from 'next/navigation'
import MatrisNivakoll from '@/components/session/matris/MatrisNivakoll'
import MatrisTrana from '@/components/session/matris/MatrisTrana'
import MatrisOvningsprov from '@/components/session/matris/MatrisOvningsprov'
import DeduktivTrana from '@/components/session/deduktiv/DeduktivTrana'
import DeduktivNivakoll from '@/components/session/deduktiv/DeduktivNivakoll'
import { hamtaSession, sessionsvy } from '@/lib/traning/motor.server'
import { hamtaVnPass, vnPassVy } from '@/lib/tester/pass.server'
import VnTrana from '@/components/session/vn/VnTrana'
import VnNivakoll from '@/components/session/vn/VnNivakoll'
import FigurserieTrana from '@/components/session/figurserie/FigurserieTrana'
import FigurserieNivakoll from '@/components/session/figurserie/FigurserieNivakoll'
import { lasTestInstallningar } from '@/lib/tester/installningar.server'
import { senasteNivakollNiva } from '@/lib/nivakoll/las.server'
import { dagSthlm } from '@/lib/traning/datum'
import { kortDatum } from '@/lib/traning/rubrik'
import { figurPassVy, hamtaFigurPass } from '@/lib/tester/pass-figur.server'
import { deduktivPassVy, hamtaDeduktivPass } from '@/lib/tester/pass-deduktiv.server'
import NivakollFlode from '@/components/traning/nivakoll/NivakollFlode'
import Steg2PassFlode from '@/components/traning/steg2pass/Steg2PassFlode'
import { hamtaSteg2Pass, steg2PassVy } from '@/lib/tester/steg2/pass.server'
import { hamtaNivakoll, nivakollVy } from '@/lib/nivakoll/motor.server'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { passSida } from '../sida.server'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function PassSessionSida({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  if (!UUID.test(sessionId)) notFound()
  const { userId, betalande } = await passSida()
  const admin = testSkrivKlient()
  const rad = await hamtaSession(admin, userId, sessionId)
  const vy = rad ? sessionsvy(rad) : null
  if (!vy) {
    // Text- och sifferpassen har samma adress (beställning omgång 2, B3).
    const vn = await hamtaVnPass(admin, userId, sessionId)
    const vnVy = vn ? vnPassVy(vn) : null
    if (vnVy) {
      // Sessionsramen (plan-testflode-2026-11-20, etapp 2).
      const [installningar, nivakoll] = await Promise.all([
        lasTestInstallningar(admin, userId),
        senasteNivakollNiva(admin, userId, vnVy.kind).catch(() => null),
      ])
      const dag = vn?.completed_at ? dagSthlm(vn.completed_at) : dagSthlm()
      return (
        <VnTrana
          kind={vnVy.kind}
          familj={vnVy.familj}
          vy={vnVy}
          forklaringEfterSvar={installningar.forklaring_efter_svar}
          harNivakoll={nivakoll != null}
          datum={kortDatum(dag)}
        />
      )
    }
    // Figurpasset har samma adress (beställning omgång 3, A3).
    const figur = await hamtaFigurPass(admin, userId, sessionId)
    const figurVy = figur ? figurPassVy(figur) : null
    if (figurVy) {
      // Sessionsramen (plan-testflode-2026-11-20, etapp 1).
      const [installningar, nivakoll] = await Promise.all([
        lasTestInstallningar(admin, userId),
        senasteNivakollNiva(admin, userId, 'figurserie').catch(() => null),
      ])
      const dag = figur?.completed_at ? dagSthlm(figur.completed_at) : dagSthlm()
      return (
        <FigurserieTrana
          vy={figurVy}
          forklaringEfterSvar={installningar.forklaring_efter_svar}
          harNivakoll={nivakoll != null}
          datum={kortDatum(dag)}
        />
      )
    }
    // Deduktivpasset har samma adress (testplanen steg 1).
    const dedu = await hamtaDeduktivPass(admin, userId, sessionId)
    const deduVy = dedu ? deduktivPassVy(dedu) : null
    if (deduVy) {
      // Sessionsramen (etapp 3). DeduktivPassFlode står kvar oanvänd till etapp 5.
      const [installningar, nivakoll] = await Promise.all([
        lasTestInstallningar(admin, userId),
        senasteNivakollNiva(admin, userId, 'deduktiv').catch(() => null),
      ])
      const dag = dedu?.completed_at ? dagSthlm(dedu.completed_at) : dagSthlm()
      return <DeduktivTrana vy={deduVy} forklaringEfterSvar={installningar.forklaring_efter_svar} harNivakoll={nivakoll != null} datum={kortDatum(dag)} />
    }
    // Passen i testplanens steg 2 har samma adress.
    const s2 = await hamtaSteg2Pass(admin, userId, sessionId)
    const s2Vy = s2 ? steg2PassVy(s2) : null
    if (s2Vy) return <Steg2PassFlode vy={s2Vy} />
    // Nivåkollen för de andra testtyperna har samma adress (testplanen steg 1).
    const koll = await hamtaNivakoll(admin, userId, sessionId)
    const kollVy = koll ? nivakollVy(koll) : null
    if (!kollVy) notFound()
    if (kollVy.kind === 'figurserie') {
      const dag = koll?.completed_at ? dagSthlm(koll.completed_at) : dagSthlm()
      return <FigurserieNivakoll vy={kollVy} betalande={betalande} datum={kortDatum(dag)} />
    }
    if (kollVy.kind === 'verbal' || kollVy.kind === 'numerisk') {
      const dag = koll?.completed_at ? dagSthlm(koll.completed_at) : dagSthlm()
      return <VnNivakoll kind={kollVy.kind} vy={kollVy} betalande={betalande} datum={kortDatum(dag)} />
    }
    if (kollVy.kind === 'deduktiv') {
      const dag = koll?.completed_at ? dagSthlm(koll.completed_at) : dagSthlm()
      return <DeduktivNivakoll vy={kollVy} betalande={betalande} datum={kortDatum(dag)} />
    }
    return <NivakollFlode vy={kollVy} betalande={betalande} />
  }
  // Sessionsramen (etapp 3): matrisens Nivåkoll, Träna, riktat och övningsprov.
  // PassFlode står kvar oanvänd till etapp 5.
  const dag = rad?.completed_at ? dagSthlm(rad.completed_at) : dagSthlm()
  const m = { vy, avslut: null, status: null }
  if (vy.typ === 'general') return <MatrisOvningsprov vy={m} />
  if (vy.typ === 'matning' || vy.typ === 'ommatning') return <MatrisNivakoll vy={m} betalande={betalande} datum={kortDatum(dag)} />
  const installningar = await lasTestInstallningar(admin, userId)
  return (
    <MatrisTrana
      begard={vy.typ === 'riktat' ? 'riktat' : 'pass'}
      family={vy.family}
      vy={m}
      forklaringEfterSvar={installningar.forklaring_efter_svar}
      betalande={betalande}
      datum={kortDatum(dag)}
    />
  )
}
