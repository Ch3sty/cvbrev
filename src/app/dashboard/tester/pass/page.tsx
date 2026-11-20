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

import PassFlode from '@/components/traning/PassFlode'
import VnTrana from '@/components/session/vn/VnTrana'
import VnNivakoll from '@/components/session/vn/VnNivakoll'
import { vnNivakollStart, vnTranaStart } from './start-vn.server'
import FigurserieTrana from '@/components/session/figurserie/FigurserieTrana'
import FigurserieNivakoll from '@/components/session/figurserie/FigurserieNivakoll'
import { testSkrivKlient } from '@/lib/tests/skrivKlient'
import { figurNivakollStart, figurTranaStart } from './start.server'
import DeduktivPassFlode from '@/components/traning/deduktivpass/DeduktivPassFlode'
import NivakollFlode from '@/components/traning/nivakoll/NivakollFlode'
import Steg2PassFlode from '@/components/traning/steg2pass/Steg2PassFlode'
import { steg2Synlig } from '@/lib/tester/steg2Status'
import { arNivakollKind } from '@/lib/nivakoll/niva'
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
  // VnPassFlode står kvar oanvänd till etapp 5.
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
  // sessionen skapas när Starta trycks. FigurPassFlode står kvar oanvänd.
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
    if (!arNivakollKind(kind)) return <PassFlode key="matning" start={{ typ: 'matning', family: null, format: null }} betalande={betalande} />
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
    return <NivakollFlode key={`nivakoll|${kind}`} kind={kind} betalande={betalande} />
  }
  // Passen i testplanens steg 2 (talserier, spatial förmåga).
  if (typ === 'steg2pass') {
    const kind = forsta(sp.kind)
    if ((kind === 'talserie' || kind === 'spatial' || kind === 'ordforrad') && steg2Synlig(kind)) {
      await passSida()
      const grupp = forsta(sp.grupp)
      return <Steg2PassFlode key={`${kind}|${grupp ?? ''}`} starta={{ kind, grupp }} />
    }
  }
  // Deduktivpasset (testplanen steg 1).
  if (typ === 'deduktivpass') {
    await passSida()
    return <DeduktivPassFlode key="deduktivpass" starta />
  }
  const begard: Begard = TYPER.includes(typ as Begard) ? (typ as Begard) : 'pass'
  const { betalande } = await passSida()
  const family = forsta(sp.family)
  const format = forsta(sp.format)
  // Nyckeln monterar om flödet när en ny start begärs från samma sida. Utan
  // den återanvänder routern komponenten (mätningens resultat står kvar på
  // /pass?typ=matning), startad-spärren hindrar en ny start och "Starta
  // dagens pass" ser död ut (ägaren 2026-10-11).
  return (
    <PassFlode
      key={`${begard}|${family ?? ''}|${format ?? ''}`}
      start={{ typ: begard, family, format }}
      betalande={betalande}
    />
  )
}
