/**
 * Inför intervjun (docs/design/rod-trad-prov-spec-2026-09-24.md, Del B,
 * design docs/design/rod-trad-prov-2026-09-24.html).
 *
 * Platsen där proven, profilen och nästa övning bor. Serverrenderad i en
 * hämtning (getInforIntervjunData), i sidmallens ordning:
 *
 *   1. PageHeader med "Nytt intervjuprov"
 *   2. Nästa handling, vyns enda bläckyta
 *   3. Dina intervjuprov, rader på mark (eller EmptyState), och kvotraden
 *      bara utan interview_unlimited
 *   4. Din personlighetsprofil, panel i tre lägen
 *
 * Aldrig fyra ytor i samma vikt i följd. Ingen betalvägg, inga lås: paketet
 * syns i sidhuvudets underrad, kvotradens textlänk och profilpanelens
 * metatext om det fördjupade testet, och ingen annanstans.
 */

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import PageHeader from '@/components/shell/PageHeader'
import InkPanel, { INK_KNAPP, INK_LANK } from '@/components/shell/InkPanel'
import StatusRow from '@/components/shell/StatusRow'
import EmptyState from '@/components/shell/EmptyState'
import { IlluScenIntervju } from '@/components/illustrations/PriserScener'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { hamtaVerifieradAnvandare } from '@/lib/supabase/verifierad-anvandare'
import { GRUNDTEST_HREF, TRANINGSPAKET_HREF, nyttProvHref, provHref } from '@/lib/intervju/lankar'
import { nar, type HubbHandling } from '@/lib/intervju/nasta'
import { getInforIntervjunData } from './getInforIntervjunData'
import InforIntervjunClient from './InforIntervjunClient'
import ProvRad, { TEXTLANK } from './components/ProvRad'
import ProfilPanel from './components/ProfilPanel'
import { KVOT, LISTA, NASTA, PROFIL, SIDA, TOM } from './infor-intervjun-copy'

export const metadata = { title: 'Inför intervjun' }
export const dynamic = 'force-dynamic'

/** Textlänken utan display, så att hidden och sm:inline-flex inte krockar. */
const LANK_UTAN_DISPLAY = TEXTLANK.replace('inline-flex ', '')

const PRIMAR =
  'inline-flex h-11 items-center justify-center rounded-lg bg-ink-1 px-4 text-sm font-medium text-white transition-colors hover:bg-ink-hover'

function handlingensCopy(h: HubbHandling, kvotKvar: boolean, utanTak: boolean, now: Date) {
  switch (h.kind) {
    case 'forstaGang':
      return {
        eyebrow: NASTA.forstaGang.eyebrow,
        rubrik: NASTA.forstaGang.rubrik,
        text: NASTA.forstaGangText(kvotKvar, utanTak),
        knapp: NASTA.forstaGang.knapp,
        href: nyttProvHref('beratta'),
      }
    case 'omskrivning':
      return {
        eyebrow: NASTA.eyebrow,
        rubrik: NASTA.omskrivning.rubrik(h.prov.question),
        text: NASTA.omskrivning.text(h.prov.level, nar(h.prov.createdAt, now), h.prov.missingKind, h.prov.question),
        knapp: NASTA.omskrivning.knapp,
        href: nyttProvHref(h.prov.question),
      }
    case 'lasIgen':
      return {
        eyebrow: NASTA.eyebrow,
        rubrik: NASTA.omskrivning.rubrik(h.prov.question),
        text: `${NASTA.omskrivning.text(h.prov.level, nar(h.prov.createdAt, now), h.prov.missingKind, h.prov.question)} ${NASTA.lasIgen.tillagg}`,
        knapp: NASTA.lasIgen.knapp,
        href: provHref(h.prov.token),
      }
    case 'nyFraga':
      return {
        eyebrow: NASTA.eyebrow,
        rubrik: NASTA.nyFraga.rubrik(h.fraga),
        text: NASTA.nyFraga.text(h.fraga),
        knapp: NASTA.nyFraga.knapp,
        href: nyttProvHref(h.fraga),
      }
    case 'helaTestet':
      return {
        eyebrow: NASTA.eyebrow,
        rubrik: NASTA.helaTestet.rubrik,
        text: NASTA.helaTestet.text,
        knapp: NASTA.helaTestet.knapp,
        href: GRUNDTEST_HREF,
      }
  }
}

function Etikett({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-sm font-medium text-ink-3">{children}</p>
}

export default async function InforIntervjunPage() {
  const user = await hamtaVerifieradAnvandare()
  if (!user) redirect('/login')

  const supabase = createServerClient({ cookies: await cookies() }) as unknown as SupabaseClient<any>
  const admin = getSupabaseAdmin() as unknown as SupabaseClient<any>
  const data = await getInforIntervjunData(supabase, admin, user.id)
  const now = new Date()
  const c = handlingensCopy(data.handling, data.kvotKvar, data.utanTak, now)

  const beskrivning = data.utanTak && data.scope ? SIDA.beskrivningUtanTak(data.scope) : SIDA.beskrivning
  const kvotSlut = !data.utanTak && !data.kvotKvar

  return (
    <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
      <InforIntervjunClient
        provCount={data.prov.length}
        hasProfile={data.profil ? 'full' : data.smakprov ? 'sample' : 'none'}
        scope={data.scope}
        nextAction={data.handling.kind}
        kvotSlut={kvotSlut}
      />

      <PageHeader
        eyebrow={SIDA.eyebrow}
        title={SIDA.titel}
        description={beskrivning}
        action={
          <Link href={nyttProvHref()} className={PRIMAR}>
            {SIDA.knapp}
          </Link>
        }
      />

      <InkPanel
        eyebrow={c.eyebrow}
        title={c.rubrik}
        text={c.text}
        scene={<IlluScenIntervju className="h-auto w-full" />}
        action={
          <Link href={c.href} className={INK_KNAPP}>
            {c.knapp}
          </Link>
        }
        secondary={
          <Link href={nyttProvHref()} className={`${INK_LANK} inline-flex min-h-11 items-center`}>
            {NASTA.sekundar}
          </Link>
        }
      />

      <section aria-label={LISTA.etikett}>
        <Etikett>{LISTA.etikett}</Etikett>
        {data.prov.length > 0 ? (
          <ul className="divide-y divide-kant border-y border-kant">
            {data.prov.map((p) => (
              <ProvRad key={p.token} prov={p} now={now} />
            ))}
          </ul>
        ) : (
          <EmptyState bare={false} title={TOM.rubrik} description={TOM.textFor(data.utanTak)} />
        )}
        {data.utanTak ? null : (
          <StatusRow
            tone="neutral"
            showDot
            wrap
            className="mt-4"
            action={
              <Link href={TRANINGSPAKET_HREF} className={`hidden sm:inline-flex ${LANK_UTAN_DISPLAY}`}>
                {KVOT.lank}
              </Link>
            }
          >
            {data.kvotKvar ? KVOT.kvar : KVOT.slut}
          </StatusRow>
        )}
        {/* På mobil står länken under raden: namnet med pris ryms inte bredvid texten. */}
        {data.utanTak ? null : (
          <Link href={TRANINGSPAKET_HREF} className={`mt-1 flex w-fit sm:hidden ${LANK_UTAN_DISPLAY}`}>
            {KVOT.lank}
          </Link>
        )}
      </section>

      <section aria-label={PROFIL.etikett}>
        <Etikett>{PROFIL.etikett}</Etikett>
        <ProfilPanel profil={data.profil} smakprov={data.smakprov} harFordjupat={data.harFordjupat} />
      </section>
    </div>
  )
}
