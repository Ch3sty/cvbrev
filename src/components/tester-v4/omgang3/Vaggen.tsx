/**
 * Väggen i Rekryteringstester, omgång 3 (skissens Hem, Main, Utveckling och
 * deras mobilvarianter). Samma vägg på Hem, Tester och Din utveckling: bara
 * golvet byts när man växlar flik. Fast höjd (558 px på dator, 344 px på
 * telefonen), flikarna, knappen och panelens överkant står på samma ställe
 * på alla tre sidorna.
 *
 *   Flikarna       Hem, Tester, Din utveckling med en underrad som säger
 *                  vad sidan gör. Riktiga länkar, tester_nav_klickad som förut.
 *   Planraden      Plan inför provet och Ändra planen, eller Välj prov.
 *   Dagens träning eyebrow med datumet, rubriken, ingressen, den stora
 *                  knappen och raden bredvid, chipsen (dagar i rad, dagsmål).
 *   Höger          det stora talet (dagar kvar, dagar i rad eller minuter
 *                  till första nivån) och banan.
 *
 * Allt kommer färdigt ur datan (lib/tester/v4/vagen.ts). Server component;
 * knappen och flikarna är små klientöar för mätningen.
 */

import Link from 'next/link'
import Topprad from '@/components/rum/Topprad'
import { veckodagNamn } from '@/lib/traning/datum'
import { HEM_HREF, PLAN_HREF, PROVDATUM_HREF, TESTER_HREF, UTVECKLING_HREF } from '@/lib/tester/v4/rutter'
import { kortDatumV, kortVeckodag } from '@/lib/tester/v4/vagen'
import type { TesterV4Data } from '@/lib/tester/v4/typer'
import { NavMedMatning } from '@/components/tester-v4/hem/HemMatning'
import type { NavVal } from '@/components/tester-v4/hem/hemData'
import { VaggBanaDator, VaggBanaMobil } from './VaggBana'
import DagensKnapp from './DagensKnapp'

export const FLIKAR: readonly { id: NavVal; href: string; namn: string; rad: string; radKort: string }[] = [
  { id: 'hem', href: HEM_HREF, namn: 'Hem', rad: 'Läget och planen till provet', radKort: 'Läget och planen' },
  { id: 'tester', href: TESTER_HREF, namn: 'Tester', rad: 'Välj test och sätt att öva', radKort: 'Välj test' },
  { id: 'utveckling', href: UTVECKLING_HREF, namn: 'Din utveckling', rad: 'Nivå, tempo och historik', radKort: 'Nivå och historik' },
]

/** Rubrikens storlek ur längden, så att den alltid får plats på en rad (mobil) och två (dator). Ingen mätning i klienten. */
export function rubrikStorlek(text: string): { mobil: number; dator: number } {
  const n = text.length
  return { mobil: Math.max(18, Math.min(24, Math.floor(372 / (n * 0.56)))), dator: n > 34 ? 38 : n > 28 ? 42 : 46 }
}

function Flikar({ aktiv }: { aktiv: NavVal }) {
  return (
    <NavMedMatning sida={aktiv} aria-label="Rekryteringstester" className="t3-flikar" data-flikar3 data-nav-tester>
      {FLIKAR.map((f) => {
        const ar = f.id === aktiv
        return (
          <Link key={f.id} href={f.href} className="t3-flik" data-nav={f.id} aria-current={ar ? 'page' : undefined} prefetch={ar ? false : undefined}>
            <b>{f.namn}</b>
            <small className="hidden xl:block">{f.rad}</small>
            <small className="xl:hidden">{f.radKort}</small>
          </Link>
        )
      })}
    </NavMedMatning>
  )
}

function Planrad({ data }: { data: TesterV4Data }) {
  const plan = data.plan
  if (!plan) {
    return (
      <p className="t3-planrad">
        <span>Vet du vilket test du ska göra?</span>
        <Link href={PLAN_HREF}>Välj prov</Link>
      </p>
    )
  }
  return (
    <p className="t3-planrad">
      <span>
        Plan inför provet: <b>{plan.provdatum ? `${plan.namn}, ${veckodagNamn(plan.provdatum)} ${kortDatumV(plan.provdatum)}` : plan.namn}</b>
      </span>
      {plan.provdatum ? <Link href={PLAN_HREF}>Ändra planen</Link> : <Link href={PROVDATUM_HREF}>Lägg till provdatum</Link>}
    </p>
  )
}

function Bock() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--koppar-ljus)' }} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  )
}

export default function Vaggen({ data, sida }: { data: TesterV4Data; sida: NavVal }) {
  const d = data.dagens
  const datumLang = `${veckodagNamn(data.idag)} ${kortDatumV(data.idag)}`
  const datumKort = `${kortVeckodag(data.idag)} ${kortDatumV(data.idag)}`
  const storlek = rubrikStorlek(d.rubrik)
  const kontext = { planTest: data.plan?.mittTest ?? null, planTyper: data.plan?.typer ?? [] }
  const pill = d.forstaSteget ? 'träning på din nivå' : null
  const harDagsmal = d.chips.some((c) => c.text.startsWith('Dagsmål'))
  const ogon = d.eyebrow.includes('·') ? d.eyebrow : `${d.eyebrow} · ${datumLang}`
  const ogonKort = d.eyebrow.includes('·') ? d.eyebrow : `${d.eyebrow} · ${datumKort}`

  return (
    <section className="t3-vagg" data-vagg3 data-sida={sida} aria-label="Dagens träning">
      <div className="t3-vagg-dekor" aria-hidden="true">
        <span className="t3-vagg-cirkel" />
      </div>

      {/* Dator, från 1280 px: skissens 1440-vägg. */}
      <div className="t3-vagg-dator hidden xl:block">
        <div className="t3-topp">
          <Flikar aktiv={sida} />
          <div className="flex items-center gap-3">
            <Planrad data={data} />
            <Topprad bara="atgarder" />
          </div>
        </div>
        <div className="t3-hero">
          <div className="t3-hero-text">
            <p className="t3-ogon">{ogon}</p>
            <h1 className="t3-h1" style={{ fontSize: storlek.dator, lineHeight: `${storlek.dator + 4}px` }}>
              {d.rubrik}
            </h1>
            <p className="t3-ingress">{d.text}</p>
            <div className="t3-knapprad">
              <DagensKnapp knapp={d.knapp} hint={d.hint} kontext={kontext} typ={d.typ} />
              {d.sidorad ? <span className="t3-sidorad">{d.sidorad}</span> : null}
            </div>
            <div className="t3-chips">
              {d.chips.map((c) => (
                <span key={c.text} className="t3-chip">
                  {c.bock ? <Bock /> : null}
                  {c.text}
                </span>
              ))}
              {harDagsmal ? (
                <Link href={PLAN_HREF} className="t3-chip-lank">
                  Ändra
                </Link>
              ) : null}
            </div>
          </div>
          <div className="t3-hero-bana">
            {d.stort ? (
              <p className="t3-stort">
                <span className="t3-stort-tal" aria-hidden="true">
                  {d.stort.tal}
                </span>
                <span className="t3-stort-rad">
                  <span className="sr-only">{d.stort.tal} </span>
                  {d.stort.rad1}
                  <br />
                  <b>{d.stort.rad2}</b>
                </span>
              </p>
            ) : null}
            <VaggBanaDator noder={data.vaggBana} pill={pill} />
          </div>
        </div>
      </div>

      {/* Telefon och smal skärm: skissens Mobil-vägg. */}
      <div className="t3-vagg-mobil xl:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <Flikar aktiv={sida} />
          </div>
          <Topprad bara="atgarder" />
        </div>
        <div className="t3-mobil-ogonrad">
          <p className="t3-ogon">{ogonKort}</p>
          {d.kortRad ? (
            data.plan ? (
              <Link href={PLAN_HREF} className="t3-kortrad">
                {d.kortRad}
              </Link>
            ) : (
              <span className="t3-kortrad">{d.kortRad}</span>
            )
          ) : null}
        </div>
        <h1 className="t3-h1-mobil" style={{ fontSize: storlek.mobil }}>
          {d.rubrik}
        </h1>
        <VaggBanaMobil noder={data.vaggBana} mitt={d.forstaSteget ? 'sedan träning på din nivå' : null} />
        <div className="t3-mobil-knapp">
          <DagensKnapp knapp={d.knapp} hint={d.hint} kontext={kontext} typ={d.typ} bred />
        </div>
      </div>
    </section>
  )
}
