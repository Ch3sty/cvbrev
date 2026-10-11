'use client'

/**
 * Jobbsökets golv under Nästa handling (spec-rummen våg 4, konceptets J1 och
 * J2): de sökta tjänsterna som rader, korsreferensen till
 * Rekryteringstester och "Mer i Jobbsöket".
 *
 * Varje tal kommer ur summeringen. "N nya" på Matchade jobb visas bara när
 * funktionen matchningar_nya() finns och svarar mer än noll; nivån i
 * korsreferensen bara när en nivåpunkt finns. Annars bjuder raden in.
 */

import Link from 'next/link'
import Rader, { Rad } from '@/components/rum/Rader'
import SektRubrik from '@/components/rum/SektRubrik'
import Kort from '@/components/rum/Kort'
import Chip from '@/components/rum/Chip'
import StatusRow from '@/components/shell/StatusRow'
import { IkonChev, SymMatris } from '@/components/illustrations/RumSymboler'
import { KNAPP_SEKUNDAR, LANK } from '@/components/shell/knappar'
import { capture } from '@/lib/analytics/events'
import { CHIP, JOBBSOK_HEM, KORS, MER } from '@/lib/rum/copy'
import { korsreferens, soktMeta, type SoktTjanst, type TraningKors } from '@/lib/rum/jobbsok'

export interface JobbsokGolvProps {
  tjanster: SoktTjanst[]
  /** Alla sökta tjänster, för länken "Alla N". */
  antal: number
  traning: TraningKors | null
  matchningarNya: number | null
  bliUpptacktSynlig: boolean
  /** 'YYYY-MM-DD' i svensk tid. */
  idag: string
  /** Visa raderna för sökta tjänster (inte i tillstånd A och B). */
  medTjanster?: boolean
}

const chev = <IkonChev size={20} className="text-ink-3" />

export function SoktaTjansterRader({ tjanster, antal }: { tjanster: SoktTjanst[]; antal: number }) {
  if (tjanster.length === 0) return null
  return (
    <div className="flex flex-col gap-4">
      <SektRubrik lank={{ href: '/dashboard/sokta-tjanster', text: JOBBSOK_HEM.soktaAlla(antal) }}>
        {JOBBSOK_HEM.soktaRubrik}
      </SektRubrik>
      <Rader label={JOBBSOK_HEM.soktaRubrik}>
        {tjanster.slice(0, 3).map((t) => (
          <Rad
            key={t.id}
            href={`/dashboard/sokta-tjanster/${t.id}`}
            titel={t.jobTitle ? `${t.company}, ${t.jobTitle}` : t.company}
            meta={soktMeta(t)}
            hoger={
              t.needsFollowUp ? (
                <span className="text-[13px] font-medium text-ink-1 underline decoration-kant-stark underline-offset-4">
                  {JOBBSOK_HEM.foljUpp}
                </span>
              ) : (
                chev
              )
            }
          />
        ))}
      </Rader>
    </div>
  )
}

export function Korsreferens({ traning, idag }: { traning: TraningKors | null; idag: string }) {
  const k = korsreferens(traning, idag)
  const klick = () => capture('korsreferens_klick', { fran: 'jobb', till: 'tran', variant: k.variant })
  if (k.variant === 'niva') {
    return (
      <StatusRow
        tone="warm"
        showDot
        wrap
        label={k.text}
        action={
          <Link href="/dashboard/tester" onClick={klick} className={`${LANK} inline-flex min-h-11 items-center`}>
            {KORS.lank}
          </Link>
        }
      >
        {k.text}
      </StatusRow>
    )
  }
  return (
    <Kort label={KORS.aldrigMattFraga}>
      <div className="flex items-center gap-3">
        <SymMatris size={40} className="shrink-0 text-ton-ink" />
        <p className="text-ey text-ink-3">{KORS.aldrigMattFraga}</p>
      </div>
      <h2 className="mt-2 font-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">
        {KORS.aldrigMattTitel}
      </h2>
      <p className="mt-1.5 text-sm leading-[21px] text-ink-2">{KORS.aldrigMattText}</p>
      <Link href="/dashboard/tester" onClick={klick} className={`${KNAPP_SEKUNDAR} mt-3.5`}>
        {KORS.lank}
      </Link>
    </Kort>
  )
}

export function MerIJobbsoket({
  matchningarNya,
  bliUpptacktSynlig,
}: {
  matchningarNya: number | null
  bliUpptacktSynlig: boolean
}) {
  const nya = matchningarNya !== null && matchningarNya > 0 ? matchningarNya : null
  return (
    <div className="flex flex-col gap-4">
      <SektRubrik as="h2">{JOBBSOK_HEM.merRubrik}</SektRubrik>
      <Rader label={JOBBSOK_HEM.merRubrik} className="lg:grid lg:grid-cols-3 lg:[&>*+*]:border-l lg:[&>*+*]:border-t-0">
        <Rad
          href="/dashboard/jobbmatchning"
          titel={MER.matchade.titel}
          meta={nya ? MER.matchade.metaNya(nya) : MER.matchade.meta}
          hoger={nya ? <Chip ton>{CHIP.nya(nya)}</Chip> : chev}
        />
        <Rad href="/dashboard/jobbcoachen" titel={MER.jobbcoachen.titel} meta={MER.jobbcoachen.meta} hoger={chev} />
        <Rad
          href="/dashboard/bli-upptackt"
          titel={MER.bliUpptackt.titel}
          meta={bliUpptacktSynlig ? MER.bliUpptackt.metaPa : MER.bliUpptackt.metaAv}
          hoger={chev}
        />
      </Rader>
    </div>
  )
}
