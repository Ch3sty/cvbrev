'use client'

/**
 * Deduktivens övningsprov i ramen (plan-testflode-2026-11-20 etapp 3):
 * startskärmen på /ovningsprov/deduktiv och provet på
 * /ovningsprov/deduktiv/<id>. Ersatte Startark och OvningsprovFlode för
 * deduktivt (raderade i etapp 5). Samma rutter och
 * kroppar: start {typ, fran}, svar {sessionId, nyckel, svar, tid}, slutför
 * {sessionId}. Hård gräns: provet lämnas in när tiden är ute.
 */

import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { START } from '@/lib/ovningsprov/copy'
import type { Ovningsformat } from '@/lib/ovningsprov/format'
import { ovningsResultat } from '@/lib/ovningsprov/resultat'
import type { DeduktivDel, Ovningsvy } from '@/lib/ovningsprov/typer'
import { ovningsprovHref, ovningsprovSessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { provRad, tranaMissatSteg } from '../resultat/nasta'
import Staplar from '@/components/traning/Staplar'
import Ovningsprov from '../lagen/Ovningsprov'
import Resultatskarm from '../Resultatskarm'
import { DEDUKTIV, type DeduktivU } from '../typer/Deduktiv'
import { SESSION } from '../copy'
import type { GenomgangPost } from '../lagen/Genomgang'
import { ovningsprovApi } from '../figurserie/api'
import OvningsprovStart from '../delat/OvningsprovStart'
import type { SparrProv } from '@/components/paywall/TestSparr'
import { monsterPerUppgift } from '../resultat/monster'

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
  /** Omgång 3: provet hon övar mot, för spärren. */
  prov?: SparrProv
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
      prov={p.prov}
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
        // 402: spärren gäller (servern såg det före sidan), 429: dagens prov är gjort.
        // Sidan läses om och visar väggen eller raden, som mäter sig själv.
        if (r.status === 429 || r.status === 402) router.refresh()
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
    return d ? [{ nyckel: p.nyckel, intro: d.intro, villkor: d.villkor, fraga: d.fraga, options: d.options, platser: d.platser ?? null, struktur: d.struktur ?? null }] : []
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
        data: g?.losning ? { ...g.losning, ledNamn: g.ledNamn ?? null } : null,
      },
      tid_s: g?.tid_s ?? null,
    }
  })
}

export interface DeduktivOvningsprovProps {
  vy: Ovningsvy
  dagarKvar: number | null
  datum: string | null
  /** Förra avslutade övningsprovet i typen (omgång 3), null när det saknas. */
  forra?: { ratt: number; antal: number } | null
}

export default function DeduktivOvningsprov({ vy, dagarKvar, datum, forra = null }: DeduktivOvningsprovProps) {
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
            forra={forra ? { ...forra, namn: 'övningsprovet' } : null}
            monster={monsterPerUppgift(v, alla.map((x) => x.u.nyckel))}
            igen={{ text: 'Gör ett nytt övningsprov', href: ovningsprovHref('deduktiv') }}
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
              lista: ctrl.lista,
              onGaIgenom: () => ctrl.gaIgenom(missar[0]?.i ?? 0),
              onVisaAlla: missar.length && missar.length < alla.length ? () => ctrl.gaIgenom(0) : null,
            }}
            tappade={vm.tappade ? { titel: vm.tappade.titel, rader: vm.tappade.rader.map((r, i) => ({ ...r, ratt: v.resultat?.tappade[i]?.ratt, antal: v.resultat?.tappade[i]?.antal })) } : null}
            tempo={{ titel: vm.tempo.titel, text: vm.tempo.text, innehall: <Staplar data={vm.tempo.staplar} aria={vm.tempo.aria} axel={vm.tempo.axel} /> }}
            nastaSteg={tranaMissatSteg({
        typ: 'deduktiv',
              monster: v.resultat?.tappade ?? [],
              typensHref: TRANING_RUTT.deduktivpass,
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
