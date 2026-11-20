'use client'

/**
 * Övningsprovets startskärm i ramen för typerna i etapp 3
 * (plan-testflode-2026-11-20 avsnitt 4.1): deduktiv slutledning och
 * Figurer och mönster (logikens övningsprov). Samma form som
 * figurseriernas: eyebrow med typen, rubriken, formatraden, scenen, tre
 * regler ur formatet och kortet med en knapp. Betalväggen är Startarkets,
 * ordagrant i mätningen (betalvagg_visad och paywall_cta_clicked med plats
 * provlage), och följer kampanjpriset. Den delas med figurseriernas och
 * ord och texts, siffror och tabellers övningsprov (OvningsprovBetalvagg).
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { capture } from '@/lib/analytics/events'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { PremiumKnappText, PremiumPrisradText, useKampanjPris } from '@/components/kampanj/KampanjPrisKontext'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'
import { START } from '@/lib/ovningsprov/copy'
import { antalTid, ordningText, type Ovningsformat, type Provtyp } from '@/lib/ovningsprov/format'
import { versal } from '@/lib/traning/copy'
import Startskarm from '../Startskarm'
import type { ScenId } from '../scener'
import { SESSION } from '../copy'

/**
 * Övningsprovets betalvägg (Startarkets, ordagrant i mätningen: betalvagg_visad
 * och paywall_cta_clicked med plats provlage och test_kind provtypen). Etapp 7:
 * en komponent för alla övningsprov, med lage och kampanjen i klicket, och
 * delbar på startskärmen (del: kortet utan knappen på mobil, knappen i foten).
 */
export function OvningsprovBetalvagg({
  typ,
  format,
  dagarKvar,
  fran,
  tillbakaHref,
  del,
}: {
  typ: Provtyp
  format: Ovningsformat
  dagarKvar: number | null
  fran: string | null
  tillbakaHref: string
  del?: 'kort' | 'fot'
}) {
  const kampanj = useKampanjPris()
  const visad = useRef(false)
  useEffect(() => {
    if (visad.current || del === 'fot') return
    visad.current = true
    capture('betalvagg_visad', { plats: 'provlage', dagar_kvar: dagarKvar, test_kind: typ, lage: 'ovningsprov', ...(fran ? { kalla: fran } : {}) })
  }, [dagarKvar, fran, typ, del])
  const B = START.betalvagg
  const knapp = (klass: string) => (
    <Link
      href={kopstegHref(SALD_PLAN, 'provlage')}
      className={`${KNAPP_PRIMAR} ${klass}`}
      onClick={() =>
        capture('paywall_cta_clicked', {
          variant: 'testniva',
          plan: SALD_PLAN,
          surface: 'ovningsprov',
          cta: 'primary',
          plats: 'provlage',
          kampanj: kampanj?.nyckel ?? null,
          test_kind: typ,
          lage: 'ovningsprov',
        })
      }
      data-startark-kop
    >
      <PremiumKnappText />
    </Link>
  )
  if (del === 'fot') return knapp('')
  return (
    <section aria-label={B.eyebrow} className="rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-5" data-startark-betalvagg>
      <p className="text-ey uppercase text-koppar-ink">{B.eyebrow}</p>
      <p className="mt-1.5 text-sm leading-5 text-ink-2">{B.text(format, dagarKvar)}</p>
      <p className="mt-1 text-sm font-medium leading-5 text-ink-1">
        <PremiumPrisradText />
      </p>
      <div className={KNAPPRAD}>
        {knapp(del === 'kort' ? 'hidden lg:inline-flex' : '')}
        <Link href={tillbakaHref} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
          {B.lank}
        </Link>
      </div>
    </section>
  )
}
OvningsprovBetalvagg.fotDel = true as const

export interface OvningsprovStartProps {
  typ: Provtyp
  testKind: string
  scen: ScenId
  format: Ovningsformat
  dagarKvar: number | null
  last: boolean
  /** Ett pågående prov: knappen fortsätter det. */
  pagaende: boolean
  /** Dagens prov är gjort: länken till resultatet. Null när det inte finns en adress. */
  gjortIdag: { href: string | null } | null
  tillbakaHref: string
  fran: string | null
  /** Skapar eller öppnar provet. Sant när navigeringen startat. */
  starta: () => Promise<boolean>
  fotnot: string
  /** Regel 2:s rad (till exempel deduktivens hjälprad). */
  regel2Text: string
  /** Typens namn i eyebrow när det skiljer sig från provtypens (logik: Figurer och mönster). */
  typnamn?: string
}

export default function OvningsprovStart(p: OvningsprovStartProps) {
  const [startar, setStartar] = useState(false)
  const [fel, setFel] = useState(false)
  const f = p.format

  const starta = async () => {
    setStartar(true)
    setFel(false)
    const ok = await p.starta()
    if (!ok) {
      setFel(true)
      setStartar(false)
    }
  }

  const gjort = !p.last && !p.pagaende && p.gjortIdag
  return (
    <Startskarm
      bas={{ test_kind: p.testKind, lage: 'ovningsprov', niva: null, format: f.nyckel }}
      tillbakaHref={p.tillbakaHref}
      eyebrow={p.typnamn ? START.eyebrow(p.typ, p.dagarKvar).replace(/^[^,]+/, p.typnamn) : START.eyebrow(p.typ, p.dagarKvar)}
      rubrik={START.rubrik}
      formatrad={START.formatTitel(f)}
      scen={p.scen}
      rita={!p.pagaende && !p.last && !gjort}
      regler={[
        { titel: `${versal(antalTid(f))}.`, text: ordningText(f) },
        { titel: 'Ingen hjälp under tiden.', text: p.regel2Text },
        { titel: 'Obesvarade räknas som fel.', text: 'Avbryter du sparas inget resultat. Provet lämnas in när tiden är ute.' },
      ]}
      sparrad={p.last ? 'premium' : gjort ? 'quota' : 'none'}
      fortsattTillganglig={p.pagaende}
      sparr={
        p.last ? (
          <OvningsprovBetalvagg typ={p.typ} format={f} dagarKvar={p.dagarKvar} fran={p.fran} tillbakaHref={p.tillbakaHref} />
        ) : gjort ? (
          <section className="rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft sm:p-5" data-gjort-idag>
            <p className="text-sm font-semibold text-ink-1">{START.gjortIdag}</p>
            <p className="mt-1 text-[13px] leading-5 text-ink-2">{START.gjortIdagText}</p>
            {p.gjortIdag && p.gjortIdag.href ? (
              <Link href={p.gjortIdag.href} className={`${KNAPP_PRIMAR} mt-3 sm:w-auto`}>
                {START.visaResultat}
              </Link>
            ) : null}
          </section>
        ) : null
      }
      knapp={{ text: p.pagaende ? SESSION.start.fortsatt.ovningsprov : SESSION.start.starta.ovningsprov, onClick: () => void starta(), laddar: startar }}
      kortRad={
        fel ? (
          <span role="alert" className="text-ink-1">
            {START.fel}
          </span>
        ) : p.pagaende ? (
          START.pagar
        ) : null
      }
      fotnot={p.fotnot}
    />
  )
}
