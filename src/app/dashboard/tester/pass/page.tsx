/**
 * Startar ett pass, en mätning, ett riktat pass eller en generalrepetition
 * (våg 3b). Länken byggs med passHref() i src/lib/traning/klient.ts:
 *
 *   /dashboard/tester/pass?typ=matning
 *   /dashboard/tester/pass?typ=pass
 *   /dashboard/tester/pass?typ=riktat&family=rotation-med-byte
 *   /dashboard/tester/pass?typ=general&format=matrigma_klassisk
 *
 * Sessionen skapas av klienten med POST (en GET-sida får aldrig skapa
 * sessioner: förhämtning och omladdning hade gjort nya). När den finns byts
 * adressen till /dashboard/tester/pass/<id> utan omladdning.
 */

import VnTrana from '@/components/session/vn/VnTrana'
import VnNivakoll from '@/components/session/vn/VnNivakoll'
import { vnNivakollStart, vnTranaStart } from './start-vn.server'
import FigurserieTrana from '@/components/session/figurserie/FigurserieTrana'
import FigurserieNivakoll from '@/components/session/figurserie/FigurserieNivakoll'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { figurNivakollStart, figurTranaStart } from './start.server'
import { redirect } from 'next/navigation'
import DeduktivTrana from '@/components/session/deduktiv/DeduktivTrana'
import DeduktivNivakoll from '@/components/session/deduktiv/DeduktivNivakoll'
import MatrisNivakoll from '@/components/session/matris/MatrisNivakoll'
import MatrisTrana from '@/components/session/matris/MatrisTrana'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { deduktivNivakollStart, deduktivTranaStart, matrisStart } from './start-etapp3.server'
import Steg2Trana from '@/components/session/steg2/Steg2Trana'
import { steg2TranaStart } from './start-steg2.server'
import { steg2Synlig } from '@/lib/tester/steg2Status'
import { arNivakollKind, arSteg2NivakollKind } from '@/lib/nivakoll/niva'
import Steg2Nivakoll from '@/components/session/steg2/Steg2Nivakoll'
import { steg2NivakollStart } from './start-nivakoll-steg2.server'
import type { Begard } from '@/lib/traning/tillgang'
import { passSida } from './sida.server'

const TYPER: readonly Begard[] = ['matning', 'pass', 'riktat', 'general']

export default async function PassStartSida({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const forsta = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null
  const typ = forsta(sp.typ)
  // Textpasset och sifferpasset (beställning omgång 2, B3); med family ett riktat pass.
  // Sessionsramen (plan-testflode-2026-11-20, etapp 2): startskärmen först.
  if (typ === 'textpass' || typ === 'sifferpass') {
    const { userId, supabase } = await passSida()
    const kind = typ === 'textpass' ? 'verbal' : 'numerisk'
    const familj = forsta(sp.family)
    const st = await vnTranaStart(supabase, testSkrivKlient(), userId, kind, familj)
    return (
      <VnTrana
        key={`${kind}|${familj ?? ''}`}
        kind={kind}
        familj={familj}
        start={st.start}
        forklaringEfterSvar={st.forklaringEfterSvar}
        harNivakoll={st.harNivakoll}
        datum={st.datum}
      />
    )
  }
  // Figurpasset (beställning omgång 3, A3).
  // Sessionsramen (plan-testflode-2026-11-20, etapp 1): startskärmen först,
  // sessionen skapas när Starta trycks.
  if (typ === 'figurpass') {
    const { userId, supabase } = await passSida()
    const st = await figurTranaStart(supabase, testSkrivKlient(), userId)
    return (
      <FigurserieTrana
        key="figurpass"
        start={st.start}
        forklaringEfterSvar={st.forklaringEfterSvar}
        harNivakoll={st.harNivakoll}
        datum={st.datum}
      />
    )
  }
  // Nivåkollen för figurserier, deduktivt, verbalt och numeriskt (testplanen steg 1).
  if (typ === 'nivakoll') {
    const kind = forsta(sp.kind)
    const { betalande, userId, supabase } = await passSida()
    // Matrisens Nivåkoll har sin egen adress (passHref('matning')).
    if (!arNivakollKind(kind)) redirect(TRANING_RUTT.matning)
    if (kind === 'figurserie') {
      const st = await figurNivakollStart(supabase, testSkrivKlient(), userId)
      if (st.idagKlar) return <FigurserieNivakoll key="nivakoll|figurserie|klar" vy={st.idagKlar} gjordIdag betalande={betalande} datum={st.datum} />
      return <FigurserieNivakoll key="nivakoll|figurserie" start={st.start} betalande={betalande} datum={st.datum} />
    }
    // Etapp 2: ord och text, siffror och tabeller i ramen.
    if (kind === 'verbal' || kind === 'numerisk') {
      const st = await vnNivakollStart(supabase, testSkrivKlient(), userId, kind)
      if (st.idagKlar) return <VnNivakoll key={`nivakoll|${kind}|klar`} kind={kind} vy={st.idagKlar} gjordIdag betalande={betalande} datum={st.datum} />
      return <VnNivakoll key={`nivakoll|${kind}`} kind={kind} start={st.start} betalande={betalande} datum={st.datum} />
    }
    // Etapp 3: deduktiv slutledning i ramen.
    if (kind === 'deduktiv') {
      const st = await deduktivNivakollStart(supabase, testSkrivKlient(), userId)
      if (st.idagKlar) return <DeduktivNivakoll key="nivakoll|deduktiv|klar" vy={st.idagKlar} gjordIdag betalande={betalande} datum={st.datum} />
      return <DeduktivNivakoll key="nivakoll|deduktiv" start={st.start} betalande={betalande} datum={st.datum} />
    }
    // Etapp 6: talserier, spatial förmåga och ordförråd i ramen.
    if (arSteg2NivakollKind(kind)) {
      if (!steg2Synlig(kind)) redirect(TRANING_RUTT.alla)
      const st = await steg2NivakollStart(supabase, testSkrivKlient(), userId, kind)
      if (st.idagKlar) return <Steg2Nivakoll key={`nivakoll|${kind}|klar`} kind={kind} vy={st.idagKlar} gjordIdag betalande={betalande} datum={st.datum} />
      return <Steg2Nivakoll key={`nivakoll|${kind}`} kind={kind} start={st.start} betalande={betalande} datum={st.datum} />
    }
    redirect(TRANING_RUTT.alla)
  }
  // Passen i testplanens steg 2 (talserier, spatial förmåga).
  if (typ === 'steg2pass') {
    const kind = forsta(sp.kind)
    if ((kind === 'talserie' || kind === 'spatial' || kind === 'ordforrad') && steg2Synlig(kind)) {
      // Sessionsramen (plan-testflode-2026-11-20, etapp 4): startskärmen först.
      const { userId, supabase } = await passSida()
      const grupp = forsta(sp.grupp)
      const st = await steg2TranaStart(supabase, testSkrivKlient(), userId, kind, grupp)
      return (
        <Steg2Trana
          key={`${kind}|${grupp ?? ''}`}
          kind={kind}
          grupp={grupp}
          start={st.start}
          harNivakoll={st.harNivakoll}
          utanNivakoll={forsta(sp.nivakoll) === 'sen'}
          forklaringEfterSvar={st.forklaringEfterSvar}
          datum={st.datum}
        />
      )
    }
  }
  // Deduktivpasset (testplanen steg 1). Sessionsramen, etapp 3:
  // startskärmen först.
  if (typ === 'deduktivpass') {
    const { userId, supabase } = await passSida()
    const st = await deduktivTranaStart(supabase, testSkrivKlient(), userId)
    return (
      <DeduktivTrana key="deduktivpass" start={st.start} forklaringEfterSvar={st.forklaringEfterSvar} harNivakoll={st.harNivakoll} datum={st.datum} />
    )
  }
  const begard: Begard = TYPER.includes(typ as Begard) ? (typ as Begard) : 'pass'
  // Logikens övningsprov startas alltid från sin startskärm (avsnitt 4.1).
  if (begard === 'general') redirect(TRANING_RUTT.provlaget)
  const { betalande, userId, supabase } = await passSida()
  const family = forsta(sp.family)
  // Sessionsramen, etapp 3: Figurer och mönster. Nivåkollen och Träna får
  // startskärmen.
  if (begard === 'matning') {
    const st = await matrisStart(supabase, testSkrivKlient(), userId, 'matning')
    return (
      <MatrisNivakoll
        key="matning"
        start={{ sparr: st.sparr === 'premium' ? 'premium' : null, pagaende: st.pagaende }}
        betalande={betalande}
        datum={st.datum}
      />
    )
  }
  if (begard === 'pass' || begard === 'riktat') {
    const st = await matrisStart(supabase, testSkrivKlient(), userId, begard, family)
    return (
      <MatrisTrana
        key={`${begard}|${family ?? ''}`}
        begard={begard}
        family={family}
        start={st}
        utanNivakoll={forsta(sp.nivakoll) === 'sen'}
        forklaringEfterSvar={st.forklaringEfterSvar}
        betalande={betalande}
        datum={st.datum}
      />
    )
  }
  redirect(TRANING_RUTT.alla)
}
