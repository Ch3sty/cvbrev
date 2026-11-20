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
import { SparrVagg, type SparrProv } from '@/components/paywall/TestSparr'
import type { TestTyp } from '@/components/illustrations/TestGlyfer'
import { testrumRubrik } from '@/components/paywall/paywall-copy'
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
  nyttUtseende = true,
  prov = null,
}: {
  typ: Provtyp
  format: Ovningsformat
  dagarKvar: number | null
  fran: string | null
  tillbakaHref: string
  del?: 'kort' | 'fot'
  /** Omgång 3 (steg 4): provet hon övar mot ur planen, läst på servern. Null: raden faller bort. */
  prov?: SparrProv
  /** Omgång 3: spärren i testflödets nya utseende. false: det tidigare kortet. */
  nyttUtseende?: boolean
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
  if (del === 'fot') return knapp('res-stor w-full')
  // Omgång 3 (steg 3b): spärren på väggen i det nya utseendet (Sparr-test i
  // startskärmens form). Samma text, pris, köp, länk och mätning som kortet.
  if (nyttUtseende) {
    return (
      <SparrVagg
        slag="premium"
        plats="provlage"
        testTyp={PROVTYP_TESTTYP[typ]}
        data={{ format: { namn: format.namn, antal: format.antal, minuter: format.minuter, text: antalTid(format) }, prov: prov ?? null }}
        dagarKvar={dagarKvar}
        titel={testrumRubrik('generalrepetition') ?? B.eyebrow}
        body={B.text(format, dagarKvar)}
        prisrad={<PremiumPrisradText />}
        kop={knapp(del === 'kort' ? 'res-stor w-full hidden lg:inline-flex' : 'res-stor w-full')}
        sekundar={
          <Link href={tillbakaHref} className={`${LANK} inline-flex min-h-11 items-center justify-center`}>
            {B.lank}
          </Link>
        }
        del={del === 'kort' ? 'kort' : undefined}
      />
    )
  }
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
/** Omgång 3: fyller startskärmens vägg i det nya utseendet (Startskarm). */
OvningsprovBetalvagg.helVagg = (p: { nyttUtseende?: boolean }) => p.nyttUtseende !== false

const PROVTYP_TESTTYP: Record<Provtyp, TestTyp> = { logik: 'matris', verbal: 'verbalt', numerisk: 'numeriskt', figurer: 'figurer', deduktiv: 'deduktiv' }

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
  /** Omgång 3: provet hon övar mot, för spärren. */
  prov?: SparrProv
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
          <OvningsprovBetalvagg typ={p.typ} format={f} dagarKvar={p.dagarKvar} fran={p.fran} tillbakaHref={p.tillbakaHref} prov={p.prov} />
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
