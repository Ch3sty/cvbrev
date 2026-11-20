'use client'

/**
 * Övningsprovet i Ord och text och Siffror och tabeller i ramen
 * (plan-testflode-2026-11-20 etapp 2): startskärmen på /ovningsprov/verbal
 * och /ovningsprov/numerisk och provet på /ovningsprov/<typ>/<id>.
 * Ersatte Startark och OvningsprovFlode för de två typerna (raderade i
 * etapp 5). Samma rutter och kroppar: start {typ, fran}, svar {sessionId,
 * nyckel, svar, tid}, slutför {sessionId}. Betalväggen är
 * OvningsprovBetalvagg, mätningen som Startarkets (plats provlage). Hård gräns: provet
 * lämnas in när klockan når noll.
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { KNAPP_PRIMAR } from '@/components/shell/knappar'
import { START } from '@/lib/ovningsprov/copy'
import { antalTid, ordningText, type Ovningsformat } from '@/lib/ovningsprov/format'
import { ovningsResultat } from '@/lib/ovningsprov/resultat'
import type { NumeriskDel, Ovningsvy, VerbalDel } from '@/lib/ovningsprov/typer'
import { versal } from '@/lib/traning/copy'
import { ovningsprovSessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { VN_TRE, type VnVisatUnderlag } from '@/lib/tester/vn-nivatest'
import Staplar from '@/components/traning/Staplar'
import Ovningsprov from '../lagen/Ovningsprov'
import Startskarm from '../Startskarm'
import { OvningsprovBetalvagg } from '../delat/OvningsprovStart'
import Resultatskarm from '../Resultatskarm'
import { vnRitare, type VnU } from '../typer/Vn'
import { SESSION } from '../copy'
import type { GenomgangPost } from '../lagen/Genomgang'
import { ovningsprovApi } from '../figurserie/api'
import { VnMissar, vnFacit } from './delar'
import { indexFor, numrera, type VnKind, type VnUtanNummer } from './las'

function bas(kind: VnKind, format: Ovningsformat) {
  return { test_kind: kind, lage: 'ovningsprov' as const, niva: null, format: format.nyckel }
}

function undertitel(f: Ovningsformat): string {
  return f.namn ? SESSION.undertitel('ovningsprov', null, f.namn) : `${SESSION.undertitel('ovningsprov')}, vårt format`
}

/* --------------------------------- Starten -------------------------------- */

export interface VnOvningsprovStartProps {
  typ: VnKind
  format: Ovningsformat
  dagarKvar: number | null
  last: boolean
  pagaende: string | null
  gjortIdag: string | null
  tillbakaHref: string
  fran: string | null
}


export function VnOvningsprovStart(p: VnOvningsprovStartProps) {
  const router = useRouter()
  const [startar, setStartar] = useState(false)
  const [fel, setFel] = useState(false)
  const f = p.format

  const starta = async () => {
    if (p.pagaende) {
      router.push(ovningsprovSessionHref(p.typ, p.pagaende))
      return
    }
    setStartar(true)
    setFel(false)
    const r = await ovningsprovApi.starta(p.typ)
    if (r.ok) {
      capture('pass_startat', { typ: 'general', variant: 'niva' })
      router.push(ovningsprovSessionHref(p.typ, r.id))
      return
    }
    // 402: spärren gäller (servern såg det före sidan), 429: dagens prov är gjort.
    // Sidan läses om och visar väggen eller raden, som mäter sig själv.
    if (r.status === 429 || r.status === 402) router.refresh()
    setFel(true)
    setStartar(false)
  }

  const gjort = !p.last && !p.pagaende && p.gjortIdag
  // Ordlistan: uppgift, inte fråga (plan-testflode-2026-11-20 avsnitt 6).
  const fe: Ovningsformat = f.enhet === 'frågor' ? { ...f, enhet: 'uppgifter' } : f
  const delar = fe.delar ? `${fe.delar.antal} ${fe.delar.ord} med ${fe.delar.per} ${fe.enhet} var.` : null
  const namn = vnRitare(p.typ).namn
  const eyebrow = p.dagarKvar === 1 ? `${namn}, dagen före provet` : p.dagarKvar === 2 ? `${namn}, två dagar före provet` : namn
  return (
    <Startskarm
      bas={bas(p.typ, f)}
      tillbakaHref={p.tillbakaHref}
      eyebrow={eyebrow}
      rubrik={START.rubrik}
      formatrad={START.formatTitel(f)}
      scen={p.typ}
      rita={!p.pagaende && !p.last && !gjort}
      regler={[
        { titel: `${versal(antalTid(fe))}.`, text: [delar, ordningText(fe)].filter(Boolean).join(' ') },
        { titel: 'Ingen hjälp under tiden.', text: p.typ === 'numerisk' ? 'Ingen förklaring och inget facit förrän efteråt. Räknare tillåten.' : 'Ingen förklaring och inget facit förrän efteråt.' },
        { titel: 'Obesvarade räknas som fel.', text: 'Avbryter du sparas inget resultat. Provet lämnas in när tiden är ute.' },
      ]}
      sparrad={p.last ? 'premium' : gjort ? 'quota' : 'none'}
      fortsattTillganglig={Boolean(p.pagaende)}
      sparr={
        p.last ? (
          <OvningsprovBetalvagg typ={p.typ} format={f} dagarKvar={p.dagarKvar} fran={p.fran} tillbakaHref={p.tillbakaHref} />
        ) : gjort ? (
          <section className="rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-5" data-gjort-idag>
            <p className="text-sm font-semibold text-ink-1">{START.gjortIdag}</p>
            <p className="mt-1 text-[13px] leading-5 text-ink-2">{START.gjortIdagText}</p>
            <Link href={ovningsprovSessionHref(p.typ, p.gjortIdag!)} className={`${KNAPP_PRIMAR} mt-3 sm:w-auto`}>
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
      fotnot={START.efter}
    />
  )
}

/* --------------------------------- Provet --------------------------------- */

function underlagFor(kind: VnKind, d: VerbalDel | NumeriskDel): VnVisatUnderlag {
  if (kind === 'verbal') {
    const v = d as VerbalDel
    return { id: v.id, typ: 'text', titel: v.titel, amne: null, text: v.text }
  }
  const n = d as NumeriskDel
  return { id: n.id, typ: 'siffror', titel: n.titel, amne: null, kontext: n.kontext || null, tabell: n.tabell, diagram: n.diagram }
}

export function vnOvningsUppgifter(vy: Ovningsvy): VnU[] {
  const kind = vy.typ as VnKind
  const per = new Map((vy.delar as (VerbalDel | NumeriskDel)[]).map((d) => [d.id, d]))
  const ul = new Map<string, VnVisatUnderlag>()
  const lista: VnUtanNummer[] = []
  for (const p of vy.punkter) {
    const d = per.get(p.del)
    if (!d) continue
    if (!ul.has(d.id)) ul.set(d.id, underlagFor(kind, d))
    const underlag = ul.get(d.id)!
    if (kind === 'verbal') {
      const v = d as VerbalDel
      lista.push({
        nyckel: p.nyckel,
        kind,
        del: d.id,
        punkt: p.punkt,
        underlag,
        text: v.pastaenden[Number(p.punkt)] ?? '',
        alternativ: VN_TRE.map((a) => ({ id: a.id, text: a.text })),
        form: 'tre',
      })
    } else {
      const q = (d as NumeriskDel).fragor.find((x) => x.id === p.punkt)
      if (!q) continue
      lista.push({ nyckel: p.nyckel, kind, del: d.id, punkt: p.punkt, underlag, text: q.text, alternativ: q.alternativ, form: 'rader' })
    }
  }
  return numrera(lista)
}

function poster(vy: Ovningsvy): GenomgangPost<VnU>[] {
  const per = new Map((vy.genomgang ?? []).map((g) => [g.nyckel, g]))
  return vnOvningsUppgifter(vy).map((u) => {
    const g = per.get(u.nyckel)
    const valt = indexFor(u, g?.svar ?? null)
    return { u, valt, facit: vnFacit(u, indexFor(u, g?.ratt) ?? -1, valt, g?.forklaring ?? null, g?.vnFacit ?? null), tid_s: g?.tid_s ?? null }
  })
}

export interface VnOvningsprovProps {
  vy: Ovningsvy
  dagarKvar: number | null
  datum: string | null
}

export default function VnOvningsprov({ vy, dagarKvar, datum }: VnOvningsprovProps) {
  const kind = vy.typ as VnKind
  const ritare = vnRitare(kind)
  return (
    <Ovningsprov<VnU>
      ritare={ritare}
      bas={bas(kind, vy.format)}
      undertitel={undertitel(vy.format)}
      vy={vy}
      uppgifter={vnOvningsUppgifter}
      // Visat index till svarsvärdet: verbalt true, false, cannot_say; numeriskt alternativets id.
      tillVarde={(i, u) => u.alternativ[i]?.id ?? ''}
      franVarde={(v, u) => indexFor(u, v)}
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
            titel={ritare.namn}
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
              miniatyrer: <VnMissar poster={missar.map((m) => ({ nr: m.i + 1, u: m.u }))} />,
              lista: ctrl.lista,
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
