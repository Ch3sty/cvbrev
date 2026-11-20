/**
 * Delar som matrisens resultat i sessionsramen (MatrisNivakoll, MatrisTrana)
 * tar från de gamla resultatvyerna, flyttade hit när vyerna raderades i
 * etapp 5 av testflödet (plan-testflode-2026-11-20). Oförändrade.
 */

import Link from 'next/link'
import { KNAPP_SEKUNDAR } from '@/components/shell/knappar'
import { familjNamn } from '@/lib/logicTestV7/familjer'
import { antalTid, ovningsformat } from '@/lib/ovningsprov/format'
import { kvittoHref, type Traningsstatus } from '@/lib/traning/klient'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import type { MilstolpeKort } from '@/lib/traning/resultat'
import { datumText } from '@/lib/traning/rubrik'
import type { PassTid } from '@/lib/traning/testplan'
import Marke, { MARKE_FOR } from './Marke'

/** "I morgon"-kortets underlag: morgondagens tema, formen och tidpunkten. */
export function imorgonFranStatus(status: Traningsstatus | null, opt: { last: boolean; reservTema?: string | null }) {
  const plan = status?.plan ?? null
  const provdatum = plan?.provdatum ?? null
  const f = ovningsformat('logik', plan?.leverantor ?? null, plan?.variant ?? null)
  const tema = familjNamn(status?.dagensTema ?? null) ?? opt.reservTema ?? null
  return {
    tema,
    passTid: (plan?.pass_tid ?? null) as PassTid | null,
    format: `${f.namn ? `samma format som ${f.namn}` : 'vårt format'}, ${antalTid(f)}`,
    provdatum: provdatum ? datumText(provdatum) : null,
    status: opt.last ? (provdatum ? PASS_COPY.efterNivakollen.gratisDatum : PASS_COPY.efterNivakollen.gratis) : PASS_COPY.efterNivakollen.betalande,
  }
}

/** Milstolpen på resultatet: märket, namnet och vägen till kvittot. */
export function MilstolpeKortVy({ m, lyft }: { m: MilstolpeKort; lyft?: boolean }) {
  return (
    <section
      aria-label={m.namn}
      className={`relative rounded-2xl border bg-papper p-4 ${lyft ? 'z-[2] -mt-[30px] border-[color:var(--lyft-kant)] shadow-lyft' : 'border-kant'}`}
    >
      <div className="flex items-center gap-3.5">
        <Marke typ={MARKE_FOR[m.nyckel]} storlek={48} />
        <div className="min-w-0">
          <p className="text-ey text-koppar-ink">{PASS_COPY.resultat.milstolpe.eyebrow}</p>
          <p className="mt-0.5 font-display text-lg font-bold leading-[23px] tracking-[-.01em] text-ink-1">{m.titel}</p>
        </div>
      </div>
      <div className="mt-3">
        <Link href={kvittoHref(m.nyckel)} className={KNAPP_SEKUNDAR}>
          {PASS_COPY.knapp.visaKvittot}
        </Link>
      </div>
    </section>
  )
}
