/**
 * Hemvyn i Rekryteringstester (våg 2), konceptets ramar 1a till 1p, T1, X1
 * och dator W1 till W4. Ritar modellen ur src/lib/traning/hemvy.ts; inga
 * egna regler här.
 *
 * Väggen säger var du är (datumet, dagsraden, veckan och kurvan), det
 * lyfta kortet vad du gör (spec 16.3.1). Exakt en kopparknapp, i kortet.
 * Golvet: Var du tappar, Provdagen, Fler tester och raden om Jobbsöket.
 *
 * Kurvan ritas i båda viewBoxarna och visas per brytpunkt, så axeltexten
 * aldrig skalas (W1).
 *
 * Server component; öarna i HemKlient är klient.
 */

import Link from 'next/link'
import Vagg from '@/components/rum/Vagg'
import Topprad from '@/components/rum/Topprad'
import Rubrik from '@/components/rum/Rubrik'
import Golv from '@/components/rum/Golv'
import LyftKort from '@/components/rum/LyftKort'
import Dagsrad from '@/components/rum/Dagsrad'
import Dagsring from '@/components/rum/Dagsring'
import Veckorad from '@/components/rum/Veckorad'
import Rader, { Rad } from '@/components/rum/Rader'
import Kort from '@/components/rum/Kort'
import SektRubrik from '@/components/rum/SektRubrik'
import {
  DorrBrev,
  DorrJobb,
  IkonChev,
  IkonKalender,
  SymMatris,
  SymOrd,
  SymPerson,
  SymPlan,
  SymSiffror,
} from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR, LANK, LANK_VAGG } from '@/components/shell/knappar'
import type { HemModell, Hoger, LyftModell, RadModell, Sektion, Symbol, Tal } from '@/lib/traning/hemvy'
import { matningsvarde } from '@/lib/traning/hemvy'
import Kurva, { Planbild } from './Kurva'
import Nivaskala from './Nivaskala'
import { EfterProvet, ForsokIgen, HemMatning, KopKnapp, LasChip, TaBortSvar } from './HemKlient'
import { PAKETRADER } from '@/components/paywall/paywall-copy'

/** Prissidan, betalväggens sekundära länk "Se vad som ingår". */
const PRISER_HREF = '/priser'

function SymbolFor({ s }: { s: Symbol }) {
  switch (s) {
    case 'matris':
      return <SymMatris size={40} />
    case 'siffror':
      return <SymSiffror size={40} />
    case 'ord':
      return <SymOrd size={40} />
    case 'person':
      return <SymPerson size={40} />
    case 'jobb':
      return (
        <span className="flex h-10 w-10 items-center justify-center">
          <DorrJobb />
        </span>
      )
    case 'brev':
      return (
        <span className="flex h-10 w-10 items-center justify-center">
          <DorrBrev />
        </span>
      )
  }
}

function HogerFor({ h }: { h: Hoger }) {
  if (h.typ === 'chev') return <IkonChev size={20} className="text-ink-3" />
  if (h.typ === 'las') return <LasChip feature={h.feature} text={h.text} plats={h.plats} />
  return (
    <Link href={h.href} className={`${LANK} inline-flex min-h-11 items-center whitespace-nowrap text-[13px]`}>
      {h.text}
    </Link>
  )
}

function RadFor({ r }: { r: RadModell }) {
  return (
    <Rad
      symbol={r.symbol ? <SymbolFor s={r.symbol} /> : undefined}
      svag={r.svag}
      titel={r.titel}
      meta={r.meta}
      stapel={r.stapel}
      hoger={r.hoger ? <HogerFor h={r.hoger} /> : undefined}
      href={r.hoger?.typ === 'chev' ? r.href : undefined}
    />
  )
}

function TreTal({ tal, pa }: { tal: [Tal, Tal, Tal]; pa: 'golv' }) {
  return (
    <dl className="grid grid-cols-3 gap-2">
      {tal.map((t) => (
        <div key={t.etikett} className="flex flex-col-reverse">
          <dt className="mt-1 text-xs leading-4 text-ink-3">{t.etikett}</dt>
          <dd className={`text-tal-tre ${t.koppar ? 'text-koppar-ink' : pa === 'golv' ? 'text-ink-1' : ''}`}>{t.varde}</dd>
        </div>
      ))}
    </dl>
  )
}

function Statusrad({ text, ton, lank, barn }: { text: string; ton: 'neutral' | 'koppar'; lank?: { text: string; href: string }; barn?: React.ReactNode }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1">
      <span className="flex min-w-0 items-center gap-2.5">
        <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${ton === 'koppar' ? 'bg-koppar' : 'bg-ink-3'}`} />
        <span>{text}</span>
      </span>
      {lank ? (
        <Link href={lank.href} className={`${LANK} inline-flex min-h-11 shrink-0 items-center text-[13px]`}>
          {lank.text}
        </Link>
      ) : null}
      {barn}
    </div>
  )
}

function Lyft({ l, bred }: { l: LyftModell; bred?: boolean }) {
  const h = l.handling
  const handling = !h ? undefined : h.typ === 'lank' ? (
    <Link href={h.href} className={KNAPP_PRIMAR}>
      {h.text}
    </Link>
  ) : h.typ === 'kop' ? (
    <KopKnapp text={h.text} plats={h.plats} dagarKvar={h.dagarKvar} />
  ) : (
    <ForsokIgen text={h.text} />
  )
  return (
    <div role={l.alert ? 'alert' : undefined} className={bred ? 'lg:col-span-2' : undefined}>
      <LyftKort
        label={l.label}
        eyebrow={l.eyebrow}
        eyebrowTon={l.eyebrowTon}
        titel={l.titel}
        text={l.text}
        handling={handling}
        sekundar={
          l.sekundar ? (
            <Link href={l.sekundar.href} className={`lank ${LANK}`}>
              {l.sekundar.text}
            </Link>
          ) : h?.typ === 'kop' ? (
            // Betalväggens sekundära är alltid en länk (knappar.ts).
            <Link href={PRISER_HREF} className={`lank ${LANK}`}>
              {PAKETRADER.jamfor}
            </Link>
          ) : undefined
        }
        fot={l.fot}
      >
        {h?.typ === 'kop' ? <p className="mt-2 text-sm font-medium text-ink-1">{h.prisrad}</p> : null}
        {l.tre ? (
          <div className="mt-3">
            <TreTal tal={l.tre} pa="golv" />
          </div>
        ) : null}
      </LyftKort>
    </div>
  )
}

function SektionFor({ s, forstaRad, spann, statusBred }: { s: Sektion; forstaRad: boolean; spann?: boolean; statusBred?: boolean }) {
  // På dator står de första korten bredvid det lyfta kortet och lyfts med det
  // (W1); rubriken flyttar då in i kortet, eftersom golvets grå text inte
  // går att läsa mot väggen.
  // Allt utanför första raden står efter korten på dator (lg:order-2).
  // Andra raden följer första (22.2 fråga 4): under ett tvåspaltskort spänner
  // första kortet i andra raden också två spalter.
  const lyftDator = forstaRad
    ? 'lg:relative lg:z-[2] lg:-mt-[30px] lg:[&>section]:shadow-lyft lg:[&>section]:border-[color:var(--lyft-kant)]'
    : `lg:order-2${spann ? ' lg:col-span-2' : ''}`
  if (s.typ === 'status') {
    return (
      <div className={statusBred ? 'lg:order-3 lg:col-span-3' : 'lg:order-2 lg:self-start'}>
        <Statusrad text={s.text} ton={s.ton} lank={s.lank} />
      </div>
    )
  }
  if (s.typ === 'tempo') {
    return (
      <div className={lyftDator}>
        <Kort label="Tempo och pass">
          {s.eyebrow ? <p className="mb-2 hidden text-ey text-ink-3 lg:block">{s.eyebrow}</p> : null}
          <TreTal tal={s.tal} pa="golv" />
          {s.meta ? <p className="mt-3 text-meta text-ink-3">{s.meta}</p> : null}
        </Kort>
      </div>
    )
  }
  return (
    <div className={`flex flex-col gap-4 ${lyftDator}`}>
      {s.rubrik ? (
        <div className={forstaRad ? 'lg:hidden' : undefined}>
          <SektRubrik lank={s.lank}>{s.rubrik}</SektRubrik>
        </div>
      ) : null}
      <Rader label={s.rubrik}>
        {s.rubrik && forstaRad ? (
          <p className="hidden px-4 pb-0 pt-3.5 text-ey text-ink-3 lg:block">{s.rubrik}</p>
        ) : null}
        {s.rader.map((r) => (
          <RadFor key={r.titel} r={r} />
        ))}
      </Rader>
    </div>
  )
}

function KurvaPaVaggen({ m }: { m: HemModell }) {
  const v = m.vagg
  if (!v.kurva && !v.planbild) return null
  return (
    <>
      {v.kurvaRubrik ? (
        <div className="mt-[22px] flex items-baseline justify-between gap-3">
          <p className="text-ey text-vagg-mjuk">
            {v.kurvaRubrik.text}
            {v.kurvaRubrik.form ? (
              <span className="ml-1 inline-flex items-center gap-1.5 normal-case tracking-normal">
                <span aria-hidden="true">·</span>
                <i aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-koppar shadow-[0_0_0_3px_rgba(224,122,47,.22)]" />
                <span className="text-xs font-medium">{v.kurvaRubrik.form}</span>
              </span>
            ) : null}
          </p>
          {v.kurvaRubrik.lank ? (
            <Link href={v.kurvaRubrik.lank.href} className={`${LANK_VAGG} inline-flex min-h-11 items-center text-[13px]`}>
              {v.kurvaRubrik.lank.text}
            </Link>
          ) : null}
        </div>
      ) : null}
      {v.kurva ? (
        <>
          <div className="lg:hidden">
            <Kurva {...v.kurva} bredd="mobil" />
          </div>
          <div className="hidden max-w-[840px] lg:block">
            <Kurva {...v.kurva} bredd="dator" />
          </div>
        </>
      ) : null}
      {v.planbild ? (
        <>
          <div className="lg:hidden">
            <Planbild {...v.planbild} bredd="mobil" />
          </div>
          <div className="hidden max-w-[840px] lg:block">
            <Planbild {...v.planbild} bredd="dator" />
          </div>
        </>
      ) : null}
      {v.kurvaMeta ? <p className="mt-2 max-w-[60ch] text-meta text-vagg-mjuk">{v.kurvaMeta}</p> : null}
    </>
  )
}

export default function Hemvy({ m }: { m: HemModell }) {
  const v = m.vagg
  const kontext = m.kontext ? (
    <Link href={m.kontext.href} className={`${LANK_VAGG} inline-flex min-h-11 items-center text-[13px]`}>
      {m.kontext.text}
    </Link>
  ) : undefined
  // Ett kort vars knapptext inte ryms på en rad spänner två kolumner
  // (art-director 20.5 punkt 2): kopparknappen bryts aldrig.
  const bredLyft = m.tillstand === 'ny' || m.tillstand === 'tomt' || m.lyft.handling?.typ === 'kop'
  // Första raden på dator (20.5 fråga 2): bara lyfta kort, en till tre.
  // Statusrader lyfts aldrig; de står i andra raden (CSS-ordningen flyttar
  // dem efter korten). Sektionsrubriken blir kortets eyebrow.
  const forstaRad = new Set<number>()
  let plats = bredLyft ? 2 : 1
  m.sektioner.forEach((s, i) => {
    if (plats >= 3 || s.typ === 'status') return
    forstaRad.add(i)
    plats++
  })
  // Andra raden på dator följer första (art-director 22.2 fråga 4): står ett
  // tvåspaltskort i första raden spänner andra radens första kort två spalter
  // (Provdagen i W3), nästa står i tredje, och statusraderna går i en tredje
  // rad över hela bredden. En rad i en tredjedelsspalt bryter titeln på högst
  // två rader.
  const andraRadSpann = bredLyft ? m.sektioner.findIndex((s, i) => !forstaRad.has(i) && s.typ !== 'status') : -1

  return (
    <div data-tillstand={m.tillstand} data-ram={m.ram} className="flex flex-1 flex-col">
      <HemMatning tillstand={matningsvarde(m.tillstand)} />
      <Vagg tat={false} className={v.provdag ? '!pb-9' : undefined}>
        <Topprad kontext={kontext} />
        {v.provdag ? (
          <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-8">
            <div>
              <h1 className="mt-6 text-ey text-vagg-mjuk lg:mt-4">{v.provdag.eyebrow}</h1>
              <p className="mt-1.5 text-tal-stor text-vagg-ink">
                {v.provdag.dag}
                <span className="font-display font-bold text-vagg-mjuk">{v.provdag.manadRest}</span>
              </p>
            </div>
            <p className="mt-3.5 max-w-[40ch] text-[15px] leading-[22px] text-vagg-mjuk">{v.provdag.text}</p>
            {v.provdag.skala ? (
              <div className="mt-[22px] lg:col-span-2 lg:mt-6 lg:max-w-[840px]">
                <Nivaskala {...v.provdag.skala} />
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <div className={v.dagsrad ? 'lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-8' : undefined}>
              <Rubrik titel={v.rubrik} rad={v.rad} liten={v.rubrikLiten} className={v.dagsrad ? 'lg:mt-0' : undefined} />
              {v.dagsrad ? (
                <div>
                  <Dagsrad
                    className="lg:mt-0"
                    ring={<Dagsring status={v.dagsrad.ring} label={v.dagsrad.ringLabel} fyllAnimering={m.nyPunkt && v.dagsrad.ring === 'gjord'} />}
                    tal={v.dagsrad.tal}
                  />
                  {v.vecka ? <Veckorad status={v.vecka.status} label={v.vecka.label} /> : null}
                </div>
              ) : null}
            </div>
            {v.datumBox ? (
              <div className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-xl border border-vagg-kant bg-white/5 px-4 py-3 text-sm leading-5 text-vagg-ink">
                <span className="flex min-w-0 items-center gap-2.5">
                  <IkonKalender size={20} className="shrink-0 text-koppar-ljus" />
                  <span>{v.datumBox.text}</span>
                </span>
                <Link href={v.datumBox.lank.href} className={`${LANK_VAGG} inline-flex min-h-11 shrink-0 items-center text-[13px]`}>
                  {v.datumBox.lank.text}
                </Link>
              </div>
            ) : null}
            {v.tomtBox ? (
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-vagg-kant bg-white/5 p-3.5 lg:max-w-[640px]">
                <SymPlan size={72} className="shrink-0 text-ljus" />
                <p className="text-meta text-vagg-mjuk">
                  <b className="font-semibold text-vagg-ink">{v.tomtBox.titel}</b> {v.tomtBox.text}
                </p>
              </div>
            ) : null}
            {v.efterKnappar ? <EfterProvet /> : null}
            <KurvaPaVaggen m={m} />
          </>
        )}
      </Vagg>
      <Golv lyft className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-4">
        <Lyft l={m.lyft} bred={bredLyft} />
        {m.sektioner.map((s, i) => (
          <SektionFor
            key={s.typ === 'tempo' ? 'tempo' : s.nyckel}
            s={s}
            forstaRad={forstaRad.has(i)}
            spann={i === andraRadSpann}
            statusBred={bredLyft}
          />
        ))}
        {m.taBortSvar ? (
          <div className="px-1 lg:order-3 lg:col-span-3">
            <TaBortSvar />
          </div>
        ) : null}
      </Golv>
    </div>
  )
}
