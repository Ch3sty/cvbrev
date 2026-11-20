'use client'

/**
 * Figurseriernas övningsprov i ramen (plan-testflode-2026-11-20 etapp 1):
 * startskärmen på /ovningsprov/figurer och provet på /ovningsprov/figurer/<id>.
 * Ersatte Startark och OvningsprovFlode för figurer (raderade i etapp 5).
 * Samma rutter och kroppar: start {typ, fran}, svar {sessionId, nyckel,
 * svar, tid}, slutför {sessionId}. Betalväggen är OvningsprovBetalvagg,
 * mätningen som Startarkets (plats provlage).
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { START } from '@/lib/ovningsprov/copy'
import { antalTid, ordningText, type Ovningsformat } from '@/lib/ovningsprov/format'
import { ovningsResultat } from '@/lib/ovningsprov/resultat'
import type { FigurDel, Ovningsvy } from '@/lib/ovningsprov/typer'
import { versal } from '@/lib/traning/copy'
import { ovningsprovHref, ovningsprovSessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { provRad, tranaMissatSteg } from '../resultat/nasta'
import Staplar from '@/components/traning/Staplar'
import Ovningsprov from '../lagen/Ovningsprov'
import Startskarm from '../Startskarm'
import { OvningsprovBetalvagg } from '../delat/OvningsprovStart'
import type { SparrProv } from '@/components/paywall/TestSparr'
import { monsterPerUppgift } from '../resultat/monster'
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
  /** Omgång 3: provet hon övar mot, för spärren. */
  prov?: SparrProv
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
    // 402: spärren gäller (servern såg det före sidan), 429: dagens prov är gjort.
    // Sidan läses om och visar väggen eller raden, som mäter sig själv.
    if (r.status === 429 || r.status === 402) router.refresh()
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
          <OvningsprovBetalvagg typ="figurer" format={f} dagarKvar={p.dagarKvar} fran={p.fran} tillbakaHref={p.tillbakaHref} prov={p.prov} />
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
  /** Förra avslutade övningsprovet i typen (omgång 3), null när det saknas. */
  forra?: { ratt: number; antal: number } | null
}

export default function FigurserieOvningsprov({ vy, dagarKvar, datum, forra = null }: FigurserieOvningsprovProps) {
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
            forra={forra ? { ...forra, namn: 'övningsprovet' } : null}
            monster={monsterPerUppgift(v, alla.map((x) => x.u.nyckel))}
            igen={{ text: 'Gör ett nytt övningsprov', href: ovningsprovHref('figurer') }}
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
              lista: ctrl.lista,
              onGaIgenom: () => ctrl.gaIgenom(missar[0]?.i ?? 0),
              onVisaAlla: missar.length && missar.length < alla.length ? () => ctrl.gaIgenom(0) : null,
            }}
            tappade={vm.tappade ? { titel: vm.tappade.titel, rader: vm.tappade.rader.map((r, i) => ({ ...r, ratt: v.resultat?.tappade[i]?.ratt, antal: v.resultat?.tappade[i]?.antal })) } : null}
            tempo={{ titel: vm.tempo.titel, text: vm.tempo.text, innehall: <Staplar data={vm.tempo.staplar} aria={vm.tempo.aria} axel={vm.tempo.axel} /> }}
            nastaSteg={tranaMissatSteg({
        typ: 'figurserie',
              monster: v.resultat?.tappade ?? [],
              typensHref: TRANING_RUTT.figurpass,
              provRad: provRad(dagarKvar),
              annars: { titel: 'Plan inför provet', text: vm.status, knapp: { text: 'Öppna planen', href: TRANING_RUTT.installningar, data: 'plan' } },
            })}
            status={null}
            tillbakaHref={TRANING_RUTT.alla}
          />
        )
      }}
    />
  )
}

