'use client'

/**
 * Figurseriernas övningsprov i ramen (plan-testflode-2026-11-20 etapp 1):
 * startskärmen på /ovningsprov/figurer och provet på /ovningsprov/figurer/<id>.
 * Ersätter Startark och OvningsprovFlode för figurer; de står kvar för de
 * andra typerna till etapp 2 och 3. Samma rutter och kroppar: start
 * {typ, fran}, svar {sessionId, nyckel, svar, tid}, slutför {sessionId}.
 * Betalväggens mätning är Startarkets, ordagrant (plats provlage).
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { PremiumKnappText, PremiumPrisradText } from '@/components/kampanj/KampanjPrisKontext'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'
import { START } from '@/lib/ovningsprov/copy'
import { antalTid, ordningText, type Ovningsformat } from '@/lib/ovningsprov/format'
import { ovningsResultat } from '@/lib/ovningsprov/resultat'
import type { FigurDel, Ovningsvy } from '@/lib/ovningsprov/typer'
import { versal } from '@/lib/traning/copy'
import { ovningsprovSessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import Staplar from '@/components/traning/Staplar'
import Ovningsprov from '../lagen/Ovningsprov'
import Startskarm from '../Startskarm'
import Resultatskarm from '../Resultatskarm'
import { FIGURSERIE, type FigurserieU } from '../typer/Figurserie'
import { SESSION } from '../copy'
import type { GenomgangPost } from '../lagen/Genomgang'
import { Miniatyrer } from './delar'
import { ovningsprovApi } from './api'

function bas(format: Ovningsformat) {
  return { test_kind: 'figurserie', lage: 'ovningsprov' as const, niva: null, format: format.nyckel }
}

function undertitel(f: Ovningsformat): string {
  return f.namn ? SESSION.undertitel('ovningsprov', null, f.namn) : `${SESSION.undertitel('ovningsprov')}, vårt format`
}

/* --------------------------------- Starten -------------------------------- */

export interface FigurserieOvningsprovStartProps {
  format: Ovningsformat
  dagarKvar: number | null
  last: boolean
  pagaende: string | null
  /** Pågående: uppgifter kvar. */
  kvar: number | null
  gjortIdag: string | null
  tillbakaHref: string
  fran: string | null
}

function Betalvagg({ format, dagarKvar, fran, tillbakaHref }: { format: Ovningsformat; dagarKvar: number | null; fran: string | null; tillbakaHref: string }) {
  const visad = useRef(false)
  useEffect(() => {
    if (visad.current) return
    visad.current = true
    capture('betalvagg_visad', { plats: 'provlage', dagar_kvar: dagarKvar, test_kind: 'figurer', ...(fran ? { kalla: fran } : {}) })
  }, [dagarKvar, fran])
  const B = START.betalvagg
  return (
    <section aria-label={B.eyebrow} className="rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-5" data-startark-betalvagg>
      <p className="text-ey uppercase text-koppar-ink">{B.eyebrow}</p>
      <p className="mt-1.5 text-sm leading-5 text-ink-2">{B.text(format, dagarKvar)}</p>
      <p className="mt-1 text-sm font-medium leading-5 text-ink-1">
        <PremiumPrisradText />
      </p>
      <div className={KNAPPRAD}>
        <Link
          href={kopstegHref(SALD_PLAN, 'provlage')}
          className={KNAPP_PRIMAR}
          onClick={() => capture('paywall_cta_clicked', { variant: 'testniva', plan: SALD_PLAN, surface: 'ovningsprov', cta: 'primary', plats: 'provlage' })}
        >
          <PremiumKnappText />
        </Link>
        <Link href={tillbakaHref} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
          {B.lank}
        </Link>
      </div>
    </section>
  )
}

export function FigurserieOvningsprovStart(p: FigurserieOvningsprovStartProps) {
  const router = useRouter()
  const [startar, setStartar] = useState(false)
  const [fel, setFel] = useState(false)
  const f = p.format

  const starta = async () => {
    if (p.pagaende) {
      router.push(ovningsprovSessionHref('figurer', p.pagaende))
      return
    }
    setStartar(true)
    setFel(false)
    const r = await ovningsprovApi.starta('figurer')
    if (r.ok) {
      capture('pass_startat', { typ: 'general', variant: 'niva' })
      router.push(ovningsprovSessionHref('figurer', r.id))
      return
    }
    if (r.status === 429) router.refresh()
    setFel(true)
    setStartar(false)
  }

  const gjort = !p.last && !p.pagaende && p.gjortIdag
  return (
    <Startskarm
      bas={bas(f)}
      tillbakaHref={p.tillbakaHref}
      eyebrow={START.eyebrow('figurer', p.dagarKvar)}
      rubrik={START.rubrik}
      formatrad={START.formatTitel(f)}
      scen="figurserie"
      rita={!p.pagaende && !p.last && !gjort}
      regler={[
        { titel: `${versal(antalTid(f))}.`, text: ordningText(f) },
        { titel: 'Ingen hjälp under tiden.', text: START.tvaFormer },
        { titel: 'Obesvarade räknas som fel.', text: 'Avbryter du sparas inget resultat. Provet lämnas in när tiden är ute.' },
      ]}
      sparrad={p.last ? 'premium' : gjort ? 'quota' : 'none'}
      fortsattTillganglig={Boolean(p.pagaende)}
      sparr={
        p.last ? (
          <Betalvagg format={f} dagarKvar={p.dagarKvar} fran={p.fran} tillbakaHref={p.tillbakaHref} />
        ) : gjort ? (
          <section className="rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-5" data-gjort-idag>
            <p className="text-sm font-semibold text-ink-1">{START.gjortIdag}</p>
            <p className="mt-1 text-[13px] leading-5 text-ink-2">{START.gjortIdagText}</p>
            <Link href={ovningsprovSessionHref('figurer', p.gjortIdag!)} className={`${KNAPP_PRIMAR} mt-3 sm:w-auto`}>
              {START.visaResultat}
            </Link>
          </section>
        ) : null
      }
      knapp={{ text: p.pagaende ? SESSION.start.fortsatt.ovningsprov : SESSION.start.starta.ovningsprov, onClick: () => void starta(), laddar: startar }}
      kortRad={
        fel ? (
          <span role="alert" className="text-ink-1">
            {START.fel}
          </span>
        ) : p.pagaende ? (
          START.pagar
        ) : null
      }
      fotnot={START.efterFigurer}
    />
  )
}

/* --------------------------------- Provet --------------------------------- */

function uppgifterFor(vy: Ovningsvy): FigurserieU[] {
  const per = new Map((vy.delar as FigurDel[]).map((d) => [d.id, d]))
  return vy.punkter.map((p) => {
    const d = per.get(p.del)!
    return { nyckel: p.nyckel, form: d.form, rad: d.rad, options: d.options }
  })
}

function poster(vy: Ovningsvy): GenomgangPost<FigurserieU>[] {
  const per = new Map((vy.genomgang ?? []).map((g) => [g.nyckel, g]))
  return uppgifterFor(vy).map((u) => {
    const g = per.get(u.nyckel)
    return {
      u,
      valt: g?.svar == null ? null : Number(g.svar),
      facit: { ratt: g ? Number(g.ratt) : -1, correct: Boolean(g?.korrekt), regel: g?.forklaring ?? null, misstag: g?.misstag ?? null },
      tid_s: g?.tid_s ?? null,
    }
  })
}

export interface FigurserieOvningsprovProps {
  vy: Ovningsvy
  dagarKvar: number | null
  datum: string | null
}

export default function FigurserieOvningsprov({ vy, dagarKvar, datum }: FigurserieOvningsprovProps) {
  return (
    <Ovningsprov<FigurserieU>
      ritare={FIGURSERIE}
      bas={bas(vy.format)}
      undertitel={undertitel(vy.format)}
      vy={vy}
      uppgifter={uppgifterFor}
      tillVarde={(i) => String(i)}
      franVarde={(v) => (v == null || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null)}
      genomgangPoster={poster}
      stangHref={TRANING_RUTT.alla}
      resultat={(v, ctrl) => {
        const vm = ovningsResultat(v, { datum, dagarKvar })
        if (!vm) return null
        const alla = poster(v)
        const missar = alla.map((x, i) => ({ ...x, i })).filter((x) => !x.facit.correct)
        return (
          <Resultatskarm
            lage="ovningsprov"
            titel={FIGURSERIE.namn}
            undertitel={undertitel(v.format)}
            datum={datum}
            onStang={ctrl.stang}
            ring={{ andel: vm.antal ? vm.ratt / vm.antal : 0, aria: SESSION.resultat.ringAria(vm.ratt, vm.antal) }}
            huvudtal={SESSION.resultat.rattAv(vm.ratt, vm.antal)}
            tal={[
              { varde: vm.tid.varde, etikett: vm.tid.etikett },
              { varde: vm.andra.varde, etikett: vm.andra.etikett, koppar: vm.andra.koppar },
            ]}
            mening={vm.mening}
            genomgang={{
              titel: SESSION.resultat.genomgangTitel(missar.length),
              text: vm.genomgang.text,
              miniatyrer: <Miniatyrer poster={missar.map((m) => ({ u: m.u, ratt: m.facit.ratt }))} />,
              onGaIgenom: () => ctrl.gaIgenom(missar[0]?.i ?? 0),
              onVisaAlla: missar.length && missar.length < alla.length ? () => ctrl.gaIgenom(0) : null,
            }}
            tappade={vm.tappade ? { titel: vm.tappade.titel, rader: vm.tappade.rader } : null}
            tempo={{ titel: vm.tempo.titel, text: vm.tempo.text, innehall: <Staplar data={vm.tempo.staplar} aria={vm.tempo.aria} axel={vm.tempo.axel} /> }}
            nastaSteg={{
              titel: 'Plan inför provet',
              text: vm.status,
              knapp: { text: 'Öppna planen', href: TRANING_RUTT.installningar, data: 'plan' },
            }}
            status={null}
            tillbakaHref={TRANING_RUTT.alla}
          />
        )
      }}
    />
  )
}

