/**
 * Personlighetsprovet, hela tolkningen (docs/design/rod-trad-prov-spec-2026-09-24.md,
 * avsnitt 3). Landningen efter claim och det enda stället där smakprovets
 * facit visas: kravprofilerna, intervjupunkterna, de omvända påståendena
 * och konsekvensen.
 *
 * Serverrenderad som intervjuprovets [token]-sida: raden läses med
 * admin-klienten efter egen kontroll av claimed_by, och en ohämtad rad
 * kopplas till kontot här (Google-registreringen landar direkt på sidan).
 * Annan användares prov, utgånget eller okänt ger 404 (proxyn svarar med
 * rätt status innan renderingen börjar).
 */

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ArrowRight } from 'lucide-react'
import PageHeader from '@/components/shell/PageHeader'
import { IlluProfilPentagon } from '@/components/illustrations/TestIllustrations'
import Segmentrad from '@/components/artiklar/personlighetsprov/Segmentrad'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaEllerGorAnsprak } from '@/lib/personlighet/smakprov-rad'
import { konsekvens, omvandaIds } from '@/lib/personlighet/smakprov-facit'
import { skalOrd, textFor } from '@/lib/personlighet/smakprov-pastaenden'
import {
  KRAVPROFILER,
  faktorUtfall,
  intervjuPunkter,
  kravUtfall,
  profilMening,
  type Faktor,
} from '@/lib/personlighet/smakprov-tolkning'
import { GRUNDTEST_HREF, INFOR_INTERVJUN_HREF } from '@/lib/intervju/lankar'
import { PROFILSIDA } from '../../infor-intervjun-copy'

export const metadata = { title: 'Din profil, hela tolkningen' }
export const dynamic = 'force-dynamic'

const PENTAGON: readonly Faktor[] = ['conscientiousness', 'extraversion', 'stability', 'agreeableness', 'openness']
const PANEL = 'rounded-xl border border-kant bg-panel p-4 sm:p-6'
const LASTEXT = 'text-sm leading-[22px] text-ink-2 sm:text-[15px] sm:leading-[23px]'

function svensktDatum(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(
    new Date(iso)
  )
}

export default async function ProfilTolkningPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const rad = await hamtaEllerGorAnsprak(admin, token, user.id)
  if (!rad) notFound()

  const faktorer = faktorUtfall(rad.scores)
  const levels = PENTAGON.map((k) => (faktorer.find((f) => f.key === k)?.segment ?? 3) / 5)
  const svar = new Map(rad.answers.map((a) => [a.id, a.value]))
  const omvanda = omvandaIds()
  const n = konsekvens(rad.answers)

  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <PageHeader eyebrow={PROFILSIDA.eyebrow} title={PROFILSIDA.titel} description={PROFILSIDA.beskrivning} />

      {/* 1. Profilen, som i provets resultat. */}
      <section className={PANEL} aria-labelledby="profil-rubrik">
        <h2 id="profil-rubrik" className="text-steg uppercase text-ink-3">
          {PROFILSIDA.profil}
        </h2>
        <p className="mt-1 text-meta text-ink-3">{PROFILSIDA.meta(svensktDatum(rad.created_at))}</p>
        <div className="mt-3 flex items-start gap-4">
          <span className="shrink-0 text-ink-1">
            <IlluProfilPentagon levels={levels} size={96} className="sm:hidden" />
            <IlluProfilPentagon levels={levels} size={112} className="hidden sm:block" />
          </span>
          <p className="mt-1 min-w-0 flex-1 text-varde text-ink-1 sm:text-xl sm:leading-[26px]">{profilMening(rad.scores)}</p>
        </div>
        <ul className="mt-4 grid gap-4 border-t border-kant pt-4">
          {faktorer.map((f) => (
            <li key={f.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold leading-5 text-ink-1">{f.namn}</span>
                <span className="whitespace-nowrap text-meta font-medium text-ink-2">{f.bandOrd}</span>
              </div>
              <Segmentrad n={f.segment} />
              <p className={`mt-2 ${LASTEXT}`}>{f.lasning}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 2. Kravprofilerna. Tabell från sm, lista per kravprofil på mobil. Aldrig procent. */}
      <section className={PANEL} aria-labelledby="krav-rubrik">
        <h2 id="krav-rubrik" className="text-kort text-ink-1">
          {PROFILSIDA.krav.rubrik}
        </h2>
        <table className="mt-3 hidden w-full border-collapse text-left text-sm sm:table">
          <thead>
            <tr className="border-b border-kant">
              {PROFILSIDA.krav.kolumner.map((k) => (
                <th key={k} scope="col" className="py-2 pr-4 text-meta font-medium text-ink-3">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-kant">
            {KRAVPROFILER.map((k) => (
              <tr key={k.namn}>
                <th scope="row" className="py-3 pr-4 align-top font-semibold text-ink-1">
                  {k.namn}
                </th>
                <td className="py-3 pr-4 align-top text-ink-2">{k.vagerTungt}</td>
                <td className="py-3 align-top font-medium text-ink-1">{kravUtfall(rad.scores, k)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="mt-3 grid divide-y divide-kant sm:hidden">
          {KRAVPROFILER.map((k) => (
            <li key={k.namn} className="py-3">
              <p className="text-sm font-semibold text-ink-1">{k.namn}</p>
              <p className="text-meta text-ink-3">{k.vagerTungt}</p>
              <p className="mt-1 text-sm font-medium text-ink-1">{kravUtfall(rad.scores, k)}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Det du kan säga på intervjun. */}
      <section className={PANEL} aria-labelledby="intervju-rubrik">
        <h2 id="intervju-rubrik" className="text-kort text-ink-1">
          {PROFILSIDA.intervju}
        </h2>
        <ol className="mt-3 grid gap-4">
          {intervjuPunkter(rad.scores).map((p, i) => (
            <li key={p.key} className="grid grid-cols-[24px_1fr] items-start gap-2">
              <span className="text-sm font-semibold tabular-nums text-ink-3">{i + 1}.</span>
              <div>
                <h3 className="text-sm font-semibold text-ink-1">{p.rubrik}</h3>
                <p className={`mt-0.5 ${LASTEXT}`}>{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. De omvända påståendena, som lista på mark. */}
      <section aria-labelledby="omvanda-rubrik">
        <h2 id="omvanda-rubrik" className="mb-2 text-sm font-medium text-ink-3">
          {PROFILSIDA.omvanda}
        </h2>
        <ul className="divide-y divide-kant border-y border-kant">
          {omvanda.map((id) => {
            const v = svar.get(id)
            return (
              <li key={id} className="py-3">
                <p className="text-sm font-medium leading-5 text-ink-1">{textFor(id)}</p>
                <p className="text-meta text-ink-3">{v ? PROFILSIDA.duSvarade(skalOrd(v)) : null}</p>
              </li>
            )
          })}
        </ul>
        <p className={`mt-3 ${LASTEXT}`}>{PROFILSIDA.konsekvens(n)}</p>
      </section>

      {/* 5. Vidare. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <Link
          href={GRUNDTEST_HREF}
          data-cta="personlighetsprov-hela-testet"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto"
        >
          {PROFILSIDA.knapp}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href={INFOR_INTERVJUN_HREF}
          className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          {PROFILSIDA.lank}
        </Link>
      </div>
    </div>
  )
}
