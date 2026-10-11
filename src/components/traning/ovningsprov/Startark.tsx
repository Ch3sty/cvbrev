'use client'

/**
 * Startarket före övningsprovet (Testerna v2, skiss 2, riktlinjerna 5.1):
 * ett ark med formatet i en rad, tre regler i tre rader och en enda knapp,
 * "Starta övningsprovet". Ingen annan vy i produkten har en startsida med
 * regler; här hör den hemma. Ordningen säger om provet anpassar sig efter
 * svaren (granskningen 6.4: meningen står här, aldrig under provet).
 *
 * Kopparknappen står i foten, inte på väggen (spec 16.3.1), så att den syns
 * utan rullning på en 360-mobil. Utan Premium byts foten mot betalväggen
 * med formatet och datumet (riktlinjerna 1.7).
 *
 * Logikens prov körs i passflödet (TRANING_RUTT.generalStart). Verbalt och
 * numeriskt startas här med POST och öppnas på sin egen adress.
 */

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { IkonTillbaka } from '@/components/illustrations/RumSymboler'
import { IlluProvlage } from '@/components/traning/illu'
import { KNAPP_PRIMAR, KNAPPRAD, LANK } from '@/components/shell/knappar'
import { kopstegHref } from '@/lib/onboarding/steps'
import { SALD_PLAN } from '@/lib/plans/plans'
import { START } from '@/lib/ovningsprov/copy'
import { ordningText, type Ovningsformat, type Provtyp } from '@/lib/ovningsprov/format'
import { ovningsprovSessionHref, TRANING_RUTT } from '@/lib/traning/rutter'
import { antalTid } from '@/lib/ovningsprov/format'
import { versal } from '@/lib/traning/copy'
import { useFlodeLage } from '../PassShell'

export interface StartarkProps {
  typ: Provtyp
  format: Ovningsformat
  dagarKvar: number | null
  /** Övningsprovet ingår inte: betalväggen i foten. */
  last: boolean
  /** Ett pågående prov i dag (verbalt och numeriskt): knappen fortsätter det. */
  pagaende?: string | null
  /** Dagens prov är redan gjort: genomgången i stället för en ny start. */
  gjortIdag?: string | null
  tillbakaHref: string
  /** Varifrån: 'provrad' när den låsta provraden i Alla tester öppnade arket. */
  fran?: string | null
}

function Symbol({ i }: { i: number }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" className="flex-shrink-0 text-vagg-ink">
      {i === 0 ? (
        <>
          <circle cx="12" cy="12" r="8.5" {...s} />
          <path d="M12 7.5V12l3 2" {...s} />
        </>
      ) : i === 1 ? (
        <>
          <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" {...s} />
          <path d="M8 8.5h8M8 12h5" {...s} />
          <path d="M6 20l12-16" {...s} strokeWidth={2} />
        </>
      ) : (
        <>
          <rect x="3.5" y="7" width="5" height="10" rx="1.5" {...s} />
          <rect x="9.5" y="7" width="5" height="10" rx="1.5" {...s} />
          <rect x="15.5" y="7" width="5" height="10" rx="1.5" {...s} strokeDasharray="2 2" />
        </>
      )}
    </svg>
  )
}

export default function Startark({ typ, format, dagarKvar, last, pagaende = null, gjortIdag = null, tillbakaHref, fran = null }: StartarkProps) {
  const router = useRouter()
  const footerRef = useRef<HTMLElement | null>(null)
  useFlodeLage(footerRef, false)
  const [startar, setStartar] = useState(false)
  const [fel, setFel] = useState(false)

  const visad = useRef(false)
  useEffect(() => {
    if (!last || visad.current) return
    visad.current = true
    capture('betalvagg_visad', { plats: 'provlage', dagar_kvar: dagarKvar, test_kind: typ, ...(fran ? { kalla: fran } : {}) })
  }, [last, dagarKvar, typ, fran])

  const starta = async () => {
    if (typ === 'logik') {
      router.push(TRANING_RUTT.generalStart)
      return
    }
    if (pagaende) {
      router.push(ovningsprovSessionHref(typ, pagaende))
      return
    }
    setStartar(true)
    setFel(false)
    try {
      const res = await fetch('/api/traning/ovningsprov/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typ, fran: 'hubb' }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.session?.id) {
        capture('pass_startat', { typ: 'general', variant: 'niva' })
        router.push(ovningsprovSessionHref(typ, data.session.id))
        return
      }
      if (res.status === 429) {
        router.refresh()
      }
      setFel(true)
    } catch {
      setFel(true)
    }
    setStartar(false)
  }

  const B = START.betalvagg
  const lyft = 'relative z-[2] -mt-[30px] rounded-2xl border border-[color:var(--lyft-kant)] bg-papper p-4 shadow-lyft'
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-golv lg:left-[248px]" data-startark={typ}>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="vagg px-4 pb-11 lg:px-10">
          <div className="mx-auto w-full max-w-[560px]">
            <div className="-mx-1 flex h-[60px] items-center gap-2 text-vagg-ink">
              <Link href={tillbakaHref} aria-label={START.tillbaka} className="-ml-1 inline-flex h-11 w-11 items-center justify-center rounded-[10px]">
                <IkonTillbaka />
              </Link>
              <span className="flex-1 text-center text-[15px] font-bold tracking-[-.01em]">{START.brand}</span>
              <span className="w-11" aria-hidden="true" />
            </div>
            <p className="text-ey uppercase text-koppar-ljus">{START.eyebrow(typ, dagarKvar)}</p>
            <h1 className="text-h1-liten mt-1 text-vagg-ink">{START.rubrik}</h1>
            <div className="mt-3.5 flex items-center gap-3.5">
              <div className="illu-vagg w-[88px] flex-shrink-0" aria-hidden="true">
                <IlluProvlage className="block h-[66px] w-[88px]" />
              </div>
              <div className="min-w-0">
                <b className="block font-display text-[17px] font-bold leading-[22px] tracking-[-.015em] text-vagg-ink">
                  {START.formatTitel(format)}
                </b>
                <span className="mt-1 block text-[13px] leading-[18px] text-vagg-mjuk">
                  {`${versal(antalTid(format))}. ${ordningText(format)}`}
                </span>
              </div>
            </div>
            {format.anmarkning ? <p className="mt-2.5 text-[12px] leading-4 text-vagg-mjuk">{format.anmarkning}</p> : null}
            <ul aria-label={START.reglerAria} className="mt-3.5 list-none overflow-hidden rounded-[14px] border border-vagg-kant bg-white/[.05] p-0">
              {START.regler.map((r, i) => (
                <li key={r.titel} className={`flex min-h-[48px] items-center gap-3 px-3.5 py-2 ${i ? 'border-t border-vagg-kant' : ''}`}>
                  <Symbol i={i} />
                  <span className="min-w-0">
                    <b className="block text-sm font-semibold leading-[19px] text-vagg-ink">{r.titel}</b>
                    <span className="block text-[12px] leading-4 text-vagg-mjuk">{r.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Handlingen i det lyfta kortet under väggen (spec 16.3.1), så att
            kopparknappen står inom första skärmen på en 360-mobil. */}
        <div className="px-4 pb-6 lg:px-10">
          <div className="mx-auto w-full max-w-[560px]">
            {last ? (
              <section aria-label={B.eyebrow} className={lyft}>
                <p className="text-sm leading-5 text-ink-2">{B.text(format, dagarKvar)}</p>
                <p className="mt-1 text-[13px] font-medium text-ink-1">{B.prisrad}</p>
                <div className={KNAPPRAD}>
                  <Link
                    href={kopstegHref(SALD_PLAN, 'provlage')}
                    className={KNAPP_PRIMAR}
                    onClick={() => capture('paywall_cta_clicked', { variant: 'testniva', plan: SALD_PLAN, surface: 'ovningsprov', cta: 'primary', plats: 'provlage' })}
                  >
                    {B.knapp}
                  </Link>
                  <Link href={tillbakaHref} className={`${LANK} inline-flex min-h-9 items-center justify-center`}>
                    {B.lank}
                  </Link>
                </div>
              </section>
            ) : gjortIdag ? (
              <section className={lyft}>
                <p className="text-sm font-semibold text-ink-1">{START.gjortIdag}</p>
                <p className="mt-1 text-[13px] leading-5 text-ink-2">{START.gjortIdagText}</p>
                {typ !== 'logik' ? (
                  <Link href={ovningsprovSessionHref(typ, gjortIdag)} className={`${KNAPP_PRIMAR} mt-3`}>
                    {START.visaResultat}
                  </Link>
                ) : null}
              </section>
            ) : (
              <section className={lyft}>
                {fel ? (
                  <p role="alert" className="mb-2 text-[13px] text-ink-1">
                    {START.fel}
                  </p>
                ) : null}
                {pagaende ? <p className="mb-2 text-[13px] leading-5 text-ink-2">{START.pagar}</p> : null}
                <button type="button" onClick={() => void starta()} disabled={startar} className={KNAPP_PRIMAR} data-starta-ovningsprov>
                  {startar ? START.startar : pagaende ? START.fortsatt : START.knapp}
                </button>
                <p className="mt-2 text-center text-meta text-ink-3">{START.avbryt}</p>
              </section>
            )}
            <p className="mx-1 mt-4 text-[13px] leading-5 text-ink-2">{typ === 'logik' ? START.efterLogik : START.efter}</p>
          </div>
        </div>
      </main>
    </div>
  )
}
