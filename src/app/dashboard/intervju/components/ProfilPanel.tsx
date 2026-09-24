/**
 * Panelen "Din personlighetsprofil" i tre lägen
 * (docs/design/rod-trad-prov-spec-2026-09-24.md, avsnitt 3, punkt 5):
 *
 *   riktig profil  arketypen som kortrubrik, fem rader med tal och 2 px-linje
 *                  (PersonalityProfileCard-mönstret, femte raden Stabilitet)
 *   smakprov       fem rader med bandord och femsegmentsmätare
 *   ingen          en mening och länken till grundtestet, aldrig till smakprovet
 *
 * Serverrenderad. Ingen betalvägg: utan tests_above_base är tredje länken
 * en metatext om var det fördjupade testet ingår.
 */

import Link from 'next/link'
import { archetypeFor } from '@/lib/recruiter/workStyle'
import { FAKTORER, faktorUtfall, profilRubrik, visadPoang } from '@/lib/personlighet/smakprov-tolkning'
import { FORDJUPAT_HREF, GRUNDTEST_HREF, profilHref } from '@/lib/intervju/lankar'
import type { SmakprovSammanfattning } from '@/lib/intervju/data'
import type { RiktigProfil } from '../getInforIntervjunData'
import { PROFIL } from '../infor-intervjun-copy'

const LANK =
  'inline-flex min-h-9 items-center text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1'

function datum(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('sv-SE', { day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' }).format(
    new Date(iso)
  )
}

function Ram({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-kant bg-panel p-4 sm:p-5">{children}</div>
}

function Lankar({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-kant pt-3">{children}</div>
}

export default function ProfilPanel({
  profil,
  smakprov,
  harFordjupat,
}: {
  profil: RiktigProfil | null
  smakprov: SmakprovSammanfattning | null
  harFordjupat: boolean
}) {
  if (profil) {
    const grund = profil.testType === 'personlighet-grund'
    const slug = grund ? 'personlighet-grund' : 'personlighet-avancerad'
    const analysHref = profil.sessionId ? `/dashboard/tester/${slug}/test/${profil.sessionId}/results` : `/dashboard/tester/${slug}`
    const d = datum(profil.completedAt)
    return (
      <Ram>
        <p className="text-kort text-ink-1">{archetypeFor(profil.scores).title}</p>
        <p className="text-meta tabular-nums text-ink-3">{grund ? PROFIL.grund.meta(d) : PROFIL.avancerad.meta(d)}</p>
        <ul className="mt-3 grid gap-2.5 border-t border-kant pt-3">
          {FAKTORER.map((f) => {
            const v = Math.round(visadPoang(profil.scores, f.key))
            return (
              <li key={f.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium leading-5 text-ink-1">{f.namn}</span>
                  <span className="text-sm font-medium tabular-nums text-ink-1">{v}</span>
                </div>
                <div className="mt-1.5 h-0.5 bg-kant" aria-hidden="true">
                  <div className="h-0.5 bg-ink-1" style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
        <Lankar>
          <Link href={analysHref} className={LANK}>
            {PROFIL.lankAnalys}
          </Link>
          <Link href="/dashboard/arbetsstil" className={LANK}>
            {PROFIL.lankArbetsstil}
          </Link>
          {grund ? (
            harFordjupat ? (
              <Link href={FORDJUPAT_HREF} className={LANK}>
                {PROFIL.lankFordjupat}
              </Link>
            ) : (
              <span className="text-meta text-ink-3">{PROFIL.fordjupatIngar}</span>
            )
          ) : null}
        </Lankar>
      </Ram>
    )
  }

  if (smakprov) {
    return (
      <Ram>
        <p className="text-kort text-ink-1">{profilRubrik(smakprov.scores)}</p>
        <p className="text-meta tabular-nums text-ink-3">{PROFIL.smakprov.meta(datum(smakprov.createdAt))}</p>
        <ul className="mt-3 grid gap-2.5 border-t border-kant pt-3">
          {faktorUtfall(smakprov.scores).map((f) => (
            <li key={f.key}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium leading-5 text-ink-1">{f.namn}</span>
                <span className="whitespace-nowrap text-meta text-ink-3">{f.bandOrd}</span>
              </div>
              <div className="mt-1.5 grid grid-cols-5 gap-1" role="img" aria-label={`${f.segment} av 5`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`h-1.5 rounded-[3px] ${i <= f.segment ? 'bg-ink-1' : 'bg-insunken'}`} />
                ))}
              </div>
            </li>
          ))}
        </ul>
        <Lankar>
          <Link href={profilHref(smakprov.token)} className={LANK}>
            {PROFIL.smakprov.lankTolkning}
          </Link>
          <Link href={GRUNDTEST_HREF} className={LANK}>
            {PROFIL.smakprov.lankHelaTestet}
          </Link>
        </Lankar>
      </Ram>
    )
  }

  return (
    <Ram>
      <p className="text-kort text-ink-1">{PROFIL.tom.rubrik}</p>
      <p className="mt-1 text-meta text-ink-3">{PROFIL.tom.text}</p>
      <Lankar>
        <Link href={GRUNDTEST_HREF} className={LANK}>
          {PROFIL.tom.lank}
        </Link>
      </Lankar>
    </Ram>
  )
}

