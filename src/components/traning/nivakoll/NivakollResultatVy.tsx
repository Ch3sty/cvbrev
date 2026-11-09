'use client'

/**
 * Nivåkollens resultat för figurserier, deduktivt, verbalt och numeriskt
 * (testplanen steg 1). Matrisens resultatvy (M1) i samma skal: nivån som
 * stort heltal på väggen, meningen om vad nivån betyder i bankens nivåer,
 * skalan 1 till 10 (förra nivåkollen som ring), tre tal. På golvet dagens
 * pass som lyft kort, "Var du tappade" och genomgången.
 *
 * Gratis: passkortet säger att passen ingår i Premium och bär vyns enda
 * köpknapp (betalvagg_visad plats matning med test_kind). Ingen fast fot
 * ovanpå en betalvägg, som i M1. Betalande: passknappen i foten.
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { KNAPP_PRIMAR, LANK } from '@/components/shell/knappar'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'
import { nivaHeltal } from '@/lib/traning/pass-copy'
import { TRANING_RUTT } from '@/lib/traning/rutter'
import { NIVAKOLL_COPY, nivaMening } from '@/lib/nivakoll/copy'
import type { NivakollKind } from '@/lib/nivakoll/niva'
import type { NivakollVy } from '@/lib/nivakoll/typer'
import Nivaskala from '../Nivaskala'
import ResultatSkal, { TreTal } from '../ResultatSkal'
import { VarDuTapparKort } from '../MatningResultatVy'

const R = NIVAKOLL_COPY.resultat

const PASS_HREF: Record<NivakollKind, string> = {
  figurserie: TRANING_RUTT.figurpass,
  deduktiv: TRANING_RUTT.deduktivpass,
  verbal: TRANING_RUTT.textpass,
  numerisk: TRANING_RUTT.sifferpass,
}

export default function NivakollResultatVy({
  vy,
  betalande,
  onGenomga,
  onTillbaka,
  motion = true,
}: {
  vy: NivakollVy
  betalande: boolean
  onGenomga: () => void
  onTillbaka: () => void
  motion?: boolean
}) {
  const r = vy.resultat
  const visad = useRef(false)
  useEffect(() => {
    if (betalande || visad.current || !r) return
    visad.current = true
    capture('betalvagg_visad', { plats: 'matning', dagar_kvar: null, test_kind: vy.kind })
  }, [betalande, r, vy.kind])
  if (!r) return null

  const heltal = nivaHeltal(r.niva)
  const snitt = Math.round(r.tid_s / Math.max(1, r.antal))
  const familjer = r.tappade.map((t, i) => ({
    titel: t.namn,
    meta: R.familjMeta(t.ratt, t.antal),
    andel: t.andel,
    ton: (i === 0 ? 'koppar' : 'ton') as 'koppar' | 'ton',
  }))

  return (
    <ResultatSkal
      label={R.label}
      kontext={R.kontext(vy.kind)}
      raknare={`${r.antal} / ${r.antal}`}
      motion={motion}
      onStang={onTillbaka}
      vagg={
        <>
          <div className="steg s1" role="status" aria-live="polite" data-nivakoll-resultat={vy.kind}>
            <p className="mt-2 text-ey text-koppar-ljus">{R.eyebrow(vy.kind)}</p>
            <p className="text-tal-stor mt-1 text-vagg-ink">
              {heltal}
              <span className="ml-2 align-baseline font-display text-[22px] font-bold tracking-normal text-vagg-mjuk">{R.av10}</span>
            </p>
            <p className="mt-2.5 max-w-[36ch] text-[15px] leading-[22px] text-vagg-mjuk">{nivaMening(vy.kind, r.vantat)}</p>
          </div>
          <div className="steg s2">
            <Nivaskala className="mt-[18px]" nu={r.niva} fran={r.fore} aria={R.skalaAria(r.niva, r.fore)} />
            <TreTal
              tal={[
                { varde: R.tal.ratt(r.ratt, r.antal), etikett: R.tal.rattEtikett },
                { varde: R.tal.ratt(r.over_tid, r.antal), etikett: R.tal.overTid },
                { varde: R.tal.sekunder(snitt), etikett: R.tal.snitt(vy.budget_s) },
              ]}
            />
            {r.fore != null ? <p className="mt-3 text-meta text-vagg-mjuk">{R.foreRad(r.fore, r.delta)}</p> : null}
          </div>
        </>
      }
      golv={
        <>
          <section
            aria-label={R.pass.eyebrow}
            className="steg s3 relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft"
            data-nivakoll-pass={r.passNiva}
          >
            <p className="text-ey text-koppar-ink">{R.pass.eyebrow}</p>
            <h2 className="mt-1 text-kort-t text-ink-1">{R.pass.titel(vy.kind, r.passNiva)}</h2>
            <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{R.pass.text(vy.kind, r.passNiva)}</p>
            {betalande ? null : (
              <>
                <p className="mt-2 text-sm font-medium leading-5 text-ink-1">{R.pass.last()}</p>
                <Link href={kopstegHref(SALD_PLAN, 'matning')} className={`${KNAPP_PRIMAR} mt-3`} data-nivakoll-kop>
                  {R.pass.kop()}
                </Link>
              </>
            )}
          </section>
          {familjer.length ? (
            <VarDuTapparKort eyebrow={R.varDuTappade} familjer={familjer} className="steg s4" lyft={false} />
          ) : (
            <section aria-label={R.varDuTappade} className="steg s4 rounded-2xl border border-kant bg-papper p-4">
              <p className="text-ey text-ink-3">{R.varDuTappade}</p>
              <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{R.ingaFamiljer}</p>
            </section>
          )}
          <div className="steg s4 flex flex-col gap-2">
            <button type="button" onClick={onGenomga} className={`${LANK} inline-flex min-h-11 items-center justify-center`} data-nivakoll-genomga>
              {NIVAKOLL_COPY.knapp.genomga}
            </button>
            {betalande ? null : (
              <button type="button" onClick={onTillbaka} className={`${LANK} inline-flex min-h-11 items-center justify-center`}>
                {NIVAKOLL_COPY.knapp.tillbaka}
              </button>
            )}
          </div>
        </>
      }
      fot={
        betalande ? (
          <>
            <Link href={PASS_HREF[vy.kind]} className={KNAPP_PRIMAR} data-nivakoll-starta-pass>
              {NIVAKOLL_COPY.knapp.startaPass(vy.kind)}
            </Link>
            <button type="button" onClick={onTillbaka} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
              {NIVAKOLL_COPY.knapp.tillbaka}
            </button>
          </>
        ) : undefined
      }
    />
  )
}
