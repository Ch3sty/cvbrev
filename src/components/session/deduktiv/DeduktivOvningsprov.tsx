'use client'

/**
 * Deduktivens övningsprov i ramen (plan-testflode-2026-11-20 etapp 3):
 * startskärmen på /ovningsprov/deduktiv och provet på
 * /ovningsprov/deduktiv/<id>. Ersätter Startark och OvningsprovFlode för
 * deduktivt; de står kvar för verbalt och numeriskt. Samma rutter och
 * kroppar: start {typ, fran}, svar {sessionId, nyckel, svar, tid}, slutför
 * {sessionId}. Hård gräns: provet lämnas in när tiden är ute.
 */

import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { START } from '@/lib/ovningsprov/copy'
import type { Ovningsformat } from '@/lib/ovningsprov/format'
import { ovningsResultat } from '@/lib/ovningsprov/resultat'
import type { DeduktivDel, Ovningsvy } from '@/lib/ovningsprov/typer'
import { ovningsprovSessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import Staplar from '@/components/traning/Staplar'
import Ovningsprov from '../lagen/Ovningsprov'
import Resultatskarm from '../Resultatskarm'
import { DEDUKTIV, type DeduktivU } from '../typer/Deduktiv'
import { SESSION } from '../copy'
import type { GenomgangPost } from '../lagen/Genomgang'
import { ovningsprovApi } from '../figurserie/api'
import OvningsprovStart from '../delat/OvningsprovStart'
import Losningsgang from './Losningsgang'

function bas(format: Ovningsformat) {
  return { test_kind: 'deduktiv', lage: 'ovningsprov' as const, niva: null, format: format.nyckel }
}

function undertitel(f: Ovningsformat): string {
  return f.namn ? SESSION.undertitel('ovningsprov', null, f.namn) : `${SESSION.undertitel('ovningsprov')}, vårt format`
}

/* --------------------------------- Starten -------------------------------- */

export interface DeduktivOvningsprovStartProps {
  format: Ovningsformat
  dagarKvar: number | null
  last: boolean
  pagaende: string | null
  gjortIdag: string | null
  tillbakaHref: string
  fran: string | null
}

export function DeduktivOvningsprovStart(p: DeduktivOvningsprovStartProps) {
  const router = useRouter()
  return (
    <OvningsprovStart
      typ="deduktiv"
      testKind="deduktiv"
      scen="deduktiv"
      format={p.format}
      dagarKvar={p.dagarKvar}
      last={p.last}
      pagaende={Boolean(p.pagaende)}
      gjortIdag={p.gjortIdag ? { href: ovningsprovSessionHref('deduktiv', p.gjortIdag) } : null}
      tillbakaHref={p.tillbakaHref}
      fran={p.fran}
      regel2Text="Utgå bara från det som står i villkoren. Lösningen kommer efteråt."
      fotnot={START.efterDeduktiv}
      starta={async () => {
        if (p.pagaende) {
          router.push(ovningsprovSessionHref('deduktiv', p.pagaende))
          return true
        }
        const r = await ovningsprovApi.starta('deduktiv')
        if (r.ok) {
          capture('pass_startat', { typ: 'general', variant: 'niva' })
          router.push(ovningsprovSessionHref('deduktiv', r.id))
          return true
        }
        if (r.status === 429) router.refresh()
        return false
      }}
    />
  )
}

/* --------------------------------- Provet --------------------------------- */

function uppgifterFor(vy: Ovningsvy): DeduktivU[] {
  const per = new Map((vy.delar as DeduktivDel[]).map((d) => [d.id, d]))
  return vy.punkter.flatMap((p) => {
    const d = per.get(p.del)
    return d ? [{ nyckel: p.nyckel, intro: d.intro, villkor: d.villkor, fraga: d.fraga, options: d.options }] : []
  })
}

function poster(vy: Ovningsvy): GenomgangPost<DeduktivU>[] {
  const per = new Map((vy.genomgang ?? []).map((g) => [g.nyckel, g]))
  return uppgifterFor(vy).map((u) => {
    const g = per.get(u.nyckel)
    return {
      u,
      valt: g?.svar == null ? null : Number(g.svar),
      facit: {
        ratt: g ? Number(g.ratt) : -1,
        correct: Boolean(g?.korrekt),
        regel: null,
        misstag: g?.misstag ?? null,
        detalj: g?.losning ? <Losningsgang losning={g.losning} /> : null,
      },
      tid_s: g?.tid_s ?? null,
    }
  })
}

export interface DeduktivOvningsprovProps {
  vy: Ovningsvy
  dagarKvar: number | null
  datum: string | null
}

export default function DeduktivOvningsprov({ vy, dagarKvar, datum }: DeduktivOvningsprovProps) {
  return (
    <Ovningsprov<DeduktivU>
      ritare={DEDUKTIV}
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
            titel={DEDUKTIV.namn}
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
