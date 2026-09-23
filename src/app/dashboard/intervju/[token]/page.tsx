/**
 * Intervjusvaret, bedömt (docs/design/intervjuprov-spec-2026-09-23.md,
 * avsnitt 5, ägarens beslut 1).
 *
 * Landningen efter claim, och det enda stället där hela återkopplingen och
 * det omskrivna svaret visas. Serverrenderad: raden läses med
 * admin-klienten efter egen kontroll av claimed_by, och en ohämtad rad
 * kopplas till kontot här (Google-registreringen landar direkt på sidan).
 * Annan användares svar, utgånget eller okänt ger 404.
 *
 * Ingen betalvägg: allt här är redan betalt med kontot.
 */

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import { ArrowRight } from 'lucide-react'
import PageHeader from '@/components/shell/PageHeader'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { hamtaEllerGorAnsprak } from '@/lib/intervju/rad'
import { klippNiva } from '@/lib/intervju/validering'
import { FRAGOR } from '@/components/artiklar/intervjuprov/fragor'
import { COPY, NIVA_ETIKETTER } from '@/components/artiklar/intervjuprov/intervjuprov-copy'

export const metadata = { title: 'Ditt intervjusvar' }
export const dynamic = 'force-dynamic'

const S = COPY.sida

function svensktDatum(iso: string): string {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Stockholm',
  }).format(new Date(iso))
}

/** Hakparenteserna i det omskrivna svaret markeras så att de syns. */
function medPlatshallare(text: string) {
  return text.split(/(\[[^\]]{1,80}\])/g).map((del, i) =>
    /^\[[^\]]+\]$/.test(del) ? (
      <mark key={i} className="rounded bg-panel px-0.5 text-ink-1 outline outline-1 outline-kant-stark">
        {del}
      </mark>
    ) : (
      <span key={i}>{del}</span>
    )
  )
}

export default async function IntervjuSvarPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const rad = await hamtaEllerGorAnsprak(admin, token, user.id)
  if (!rad) notFound()

  const fraga = FRAGOR[rad.question]
  const niva = klippNiva(rad.level)
  const punkter = rad.full?.points ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
      <PageHeader eyebrow={S.eyebrow} title={S.titel} description={S.beskrivning} />

      <section className="rounded-xl border border-kant bg-panel p-4 sm:p-6">
        <blockquote className="border-l-[3px] border-accent py-0.5 pl-3 font-display text-lg font-semibold leading-6 tracking-[-0.01em] text-ink-1 sm:text-xl sm:leading-[26px]">
          {COPY.fraga(fraga.text)}
        </blockquote>

        <h2 className="mt-4 text-sm font-medium text-ink-2">{S.dittSvar}</h2>
        <p className="mt-1 whitespace-pre-line rounded-lg border border-kant bg-insunken p-3 text-base leading-6 text-ink-1 shadow-insunken">
          {rad.answer}
        </p>

        <p className="mt-6 text-steg uppercase text-ink-3">{COPY.resultat.eyebrow}</p>
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="text-tal-display text-ink-1">{niva}</span>
          <span className="text-sm text-ink-3">{COPY.resultat.av}</span>
        </div>
        <div className="mt-2.5 grid grid-cols-5 gap-1" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={`h-1.5 rounded-[3px] ${n <= niva ? 'bg-ink-1' : 'bg-insunken'}`} />
          ))}
        </div>
        <p className="mt-2.5 text-varde text-ink-1">
          {NIVA_ETIKETTER[niva]}. {rad.summary}
        </p>

        <ul className="mt-4 grid gap-3 border-t border-kant pt-4">
          <li className="grid grid-cols-[10px_1fr] items-start gap-2.5">
            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-positiv" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink-1">{COPY.punkt.fungerar}</p>
              <p className="text-sm leading-[22px] text-ink-2 sm:text-[15px] sm:leading-[23px]">{rad.works}</p>
            </div>
          </li>
          <li className="grid grid-cols-[10px_1fr] items-start gap-2.5">
            <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-varning" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-ink-1">{COPY.punkt.saknas}</p>
              <p className="text-sm leading-[22px] text-ink-2 sm:text-[15px] sm:leading-[23px]">{rad.missing}</p>
            </div>
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-kant bg-panel p-4 sm:p-6">
        <h2 className="text-kort text-ink-1">{rad.question === 'star' ? S.aterkopplingStar : S.aterkoppling}</h2>
        <ol className="mt-3 grid gap-4">
          {punkter.map((p, i) => (
            <li key={i} className="grid grid-cols-[24px_1fr] items-start gap-2">
              <span className="text-sm font-semibold tabular-nums text-ink-3">{i + 1}.</span>
              <div>
                <p className="text-sm font-semibold text-ink-1">{p.title}</p>
                <p className="mt-0.5 text-sm leading-[22px] text-ink-2 sm:text-[15px] sm:leading-[23px]">{p.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl border border-kant bg-panel p-4 sm:p-6">
        <h2 className="text-kort text-ink-1">{S.omskrivet}</h2>
        {rad.improved_why ? <p className="mt-1 text-sm leading-[22px] text-ink-2">{rad.improved_why}</p> : null}
        <p className="mt-3 whitespace-pre-line rounded-lg border border-kant bg-insunken p-3 text-base leading-6 text-ink-1 shadow-insunken">
          {medPlatshallare(rad.improved_answer)}
        </p>
        <p className="mt-2 text-meta text-ink-3">
          {S.platshallare} {S.sparasTill(svensktDatum(rad.expires_at))}
        </p>

        <Link
          href="/dashboard/jobbcoachen"
          data-cta="intervjuprov-jobbcoachen"
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink-1 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-hover sm:w-auto"
        >
          {S.knapp}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  )
}
