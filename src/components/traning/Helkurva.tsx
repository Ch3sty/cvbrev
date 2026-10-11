/**
 * Hela kurvan (konceptets F1, /dashboard/tester/kurvan): nivån per dag i
 * full höjd med siktet, planraden och provet, legenden i fyra rader och
 * små multiplar per testtyp. Personlighetstestet har ingen kurva.
 *
 * Bara matrisnivån har punkter i dag (motorn mäter figurer och mönster);
 * de andra typerna står som rader utan kurva tills de har en nivå.
 *
 * Server component.
 */

import Link from 'next/link'
import Vagg from '@/components/rum/Vagg'
import Topprad from '@/components/rum/Topprad'
import Rubrik from '@/components/rum/Rubrik'
import Golv from '@/components/rum/Golv'
import LyftKort from '@/components/rum/LyftKort'
import Rader, { Rad } from '@/components/rum/Rader'
import SektRubrik from '@/components/rum/SektRubrik'
import { SymOrd, SymSiffror, SymPlan } from '@/components/illustrations/RumSymboler'
import { KNAPP_PRIMAR, LANK, LANK_VAGG } from '@/components/shell/knappar'
import type { Traningsstatus } from '@/lib/traning/motor.server'
import { decimal, kurvansLabel, type FlerTesterIn } from '@/lib/traning/hemvy'
import { datumText, kortDatum } from '@/lib/traning/rubrik'
import { dagarMellan } from '@/lib/traning/datum'
import { HEM, ingarIPaketet } from '@/lib/traning/hem-copy'
import { KURVAN } from '@/lib/traning/kurvan-copy'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { talord } from '@/lib/traning/copy'
import Kurva from './Kurva'
import { LasChip } from './HemKlient'

function Legendpunkt({ typ }: { typ: 'pass' | 'matning' | 'sikte' | 'plan' }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      {typ === 'pass' ? <circle cx="12" cy="12" r="4" fill="var(--koppar)" /> : null}
      {typ === 'matning' ? <circle cx="12" cy="12" r="6" fill="var(--koppar)" stroke="var(--koppar-ljus)" strokeWidth="2.5" /> : null}
      {typ === 'sikte' ? <line x1="3" x2="21" y1="12" y2="12" stroke="var(--ton-ink)" strokeWidth="1.5" strokeDasharray="4 4" /> : null}
      {typ === 'plan' ? <circle cx="12" cy="12" r="3.5" fill="none" stroke="var(--kant-stark)" strokeWidth="1.5" /> : null}
    </svg>
  )
}

export default function Helkurva({ s, fler }: { s: Traningsstatus | null; fler: FlerTesterIn }) {
  const kontext = (
    <Link href={TRANING_RUTT.installningarSteg(3)} className={`${LANK_VAGG} inline-flex min-h-11 items-center text-[13px]`}>
      {KURVAN.kontext}
    </Link>
  )
  const pers = fler.personlighetKlar
  const persDag = pers ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(pers)) : null

  if (!s || !s.start || s.niva == null) {
    return (
      <div className="flex flex-1 flex-col">
        <Vagg tat={false}>
          <Topprad brand={KURVAN.brand} kontext={kontext} />
          <Rubrik titel={KURVAN.rubrik} rad={KURVAN.tomRad} />
          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-vagg-kant bg-white/5 p-3.5 lg:max-w-[640px]">
            <SymPlan size={72} className="shrink-0 text-ljus" />
            <p className="text-meta text-vagg-mjuk">
              <b className="font-semibold text-vagg-ink">{HEM.tomt.boxTitel}</b> {HEM.tomt.boxText}
            </p>
          </div>
        </Vagg>
        <Golv lyft>
          <LyftKort
            label={HEM.matning.eyebrow}
            eyebrow={HEM.matning.eyebrow}
            titel={HEM.matning.titel}
            text={HEM.matning.text}
            handling={
              <Link href={TRANING_RUTT.matning} className={`${KNAPP_PRIMAR} lg:w-auto`}>
                {HEM.matning.knapp}
              </Link>
            }
          />
        </Golv>
      </div>
    )
  }

  const prov = s.plan?.provdatum && s.dagarKvar != null && s.dagarKvar >= 0 ? s.plan.provdatum : null
  const sikte = s.plan?.sikte ?? null
  const dagar = dagarMellan(s.start.dag, s.idag)
  const rad = [
    `${decimal(s.start.niva)} till ${decimal(s.niva)} på ${talord(Math.max(1, dagar), 'en')} ${dagar === 1 ? 'dag' : 'dagar'}.`,
    sikte != null && prov ? `Sikte ${decimal(sikte)} den ${datumText(prov)}.` : null,
    KURVAN.passFlyttar,
  ]
    .filter(Boolean)
    .join(' ')
  const kurva = {
    punkter: s.punkter,
    plan: s.plandagar,
    idag: s.idag,
    start: s.start.dag,
    prov,
    sikte,
    nyPunkt: false,
  }
  const label = kurvansLabel(kurva, !s.dagensPassGjort)

  return (
    <div className="flex flex-1 flex-col" data-tillstand="kurvan" data-ram="F1">
      <Vagg tat={false}>
        <Topprad brand={KURVAN.brand} kontext={kontext} />
        <Rubrik titel={KURVAN.figurer} rad={rad} liten />
        <div className="mt-4 lg:hidden">
          <Kurva {...kurva} bredd="mobil" hojd="full" ariaLabel={label} idPrefix="hela" />
        </div>
        <div className="mt-4 hidden max-w-[840px] lg:block">
          <Kurva {...kurva} bredd="dator" hojd="full" ariaLabel={label} idPrefix="hela" />
        </div>
      </Vagg>
      <Golv lyft className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
        <LyftKort label={KURVAN.legend.rubrik} eyebrow={KURVAN.legend.rubrik} eyebrowTon="neutral">
          <div className="-mx-4 mt-2 [&>*+*]:border-t [&>*+*]:border-kant">
            <Rad symbol={<Legendpunkt typ="pass" />} titel={KURVAN.legend.pass} meta={KURVAN.legend.passMeta} />
            <Rad symbol={<Legendpunkt typ="matning" />} titel={KURVAN.legend.matning} meta={KURVAN.legend.matningMeta} />
            <Rad symbol={<Legendpunkt typ="sikte" />} titel={KURVAN.legend.sikte} meta={KURVAN.legend.sikteMeta} />
            <Rad symbol={<Legendpunkt typ="plan" />} titel={KURVAN.legend.plan} meta={KURVAN.legend.planMeta} />
          </div>
        </LyftKort>
        <div className="flex flex-col gap-4">
          {s.historikLast ? (
            <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1">
              <span>{KURVAN.historikLast}</span>
              <LasChip feature="tests_above_base" text={ingarIPaketet()} label={`${KURVAN.historikLast} Låst, ${ingarIPaketet().toLowerCase()}.`} />
            </div>
          ) : null}
          <SektRubrik>{KURVAN.flerKurvor}</SektRubrik>
          <Rader label={KURVAN.flerKurvor}>
            <Rad
              symbol={<SymOrd size={40} />}
              svag={!fler.verbalSenast}
              titel={HEM.flerTester.ord}
              meta={KURVAN.ingenKurva(fler.verbalSenast ? kortDatum(dagSv(fler.verbalSenast)) : null)}
              href="/dashboard/tester/verbal-resonemang"
            />
            <Rad
              symbol={<SymSiffror size={40} />}
              svag={!fler.numeriskSenast}
              titel={HEM.flerTester.siffror}
              meta={KURVAN.ingenKurva(fler.numeriskSenast ? kortDatum(dagSv(fler.numeriskSenast)) : null)}
              href="/dashboard/tester/numeriskt-test"
            />
          </Rader>
          <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-kant bg-papper px-4 py-3 text-sm leading-5 text-ink-1">
            <span className="flex items-center gap-2.5">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-ink-3" />
              {KURVAN.personlighet(persDag ? datumText(persDag) : null)}
            </span>
            <Link href={TRANING_RUTT.personlighet} className={`${LANK} inline-flex min-h-11 shrink-0 items-center text-[13px]`}>
              {persDag ? KURVAN.visaProfilen : KURVAN.gorProfilen}
            </Link>
          </div>
        </div>
      </Golv>
    </div>
  )
}

function dagSv(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date(iso))
}
