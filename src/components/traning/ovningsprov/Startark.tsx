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

export default function Startark({ typ, format, dagarKvar, last, pagaende = null, gjortIdag = null, tillbakaHref }: StartarkProps) {
  const router = useRouter()
  const footerRef = useRef<HTMLElement | null>(null)
  useFlodeLage(footerRef, true)
  const [startar, setStartar] = useState(false)
  const [fel, setFel] = useState(false)

  const visad = useRef(false)
  useEffect(() => {
    if (!last || visad.current) return
    visad.current = true
    capture('betalvagg_visad', { plats: 'provlage', dagar_kvar: dagarKvar })
  }, [last, dagarKvar])

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
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-golv lg:left-[248px]" data-startark={typ}>
      <main className="vagg min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 lg:px-10">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="-mx-1 flex h-[60px] items-center gap-2 text-vagg-ink">
            <Link href={tillbakaHref} aria-label={START.tillbaka} className="-ml-1 inline-flex h-11 w-11 items-center justify-center rounded-[10px]">
              <IkonTillbaka />
            </Link>
            <span className="flex-1 text-center text-[15px] font-bold tracking-[-.01em]">{START.brand}</span>
            <span className="w-11" aria-hidden="true" />
          </div>
          <p className="mt-1 text-ey uppercase text-koppar-ljus">{START.eyebrow(typ, dagarKvar)}</p>
          <h1 className="text-h1-liten mt-1 text-vagg-ink">{START.rubrik}</h1>
          <div className="mt-4 flex items-center gap-3.5">
            <div className="illu-vagg w-[96px] flex-shrink-0" aria-hidden="true">
              <IlluProvlage className="block h-[72px] w-[96px]" />
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
              <li key={r.titel} className={`flex min-h-[52px] items-center gap-3 px-3.5 py-2.5 ${i ? 'border-t border-vagg-kant' : ''}`}>
                <Symbol i={i} />
                <span className="min-w-0">
                  <b className="block text-sm font-semibold leading-[19px] text-vagg-ink">{r.titel}</b>
                  <span className="block text-[12px] leading-4 text-vagg-mjuk">{r.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[13px] leading-5 text-vagg-mjuk">{typ === 'logik' ? START.efterLogik : START.efter}</p>
          {pagaende ? <p className="mt-2 text-[13px] leading-5 text-vagg-ink">{START.pagar}</p> : null}
        </div>
      </main>
      <footer ref={footerRef} className="flex-shrink-0 border-t border-kant bg-papper" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="mx-auto flex w-full max-w-[560px] flex-col gap-1 px-4 py-3">
          {last ? (
            <section aria-label={B.eyebrow}>
              <p className="text-ey uppercase text-koppar-ink">{B.eyebrow}</p>
              <p className="mt-1 text-sm leading-5 text-ink-2">{B.text(format, dagarKvar)}</p>
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
            <>
              <p className="text-sm font-semibold text-ink-1">{START.gjortIdag}</p>
              <p className="text-[13px] leading-5 text-ink-2">{START.gjortIdagText}</p>
              {typ !== 'logik' ? (
                <Link href={ovningsprovSessionHref(typ, gjortIdag)} className={`${KNAPP_PRIMAR} mt-2`}>
                  {START.visaResultat}
                </Link>
              ) : null}
            </>
          ) : (
            <>
              {fel ? (
                <p role="alert" className="text-[13px] text-ink-1">
                  {START.fel}
                </p>
              ) : null}
              <button type="button" onClick={() => void starta()} disabled={startar} className={KNAPP_PRIMAR} data-starta-ovningsprov>
                {startar ? START.startar : pagaende ? START.fortsatt : START.knapp}
              </button>
              <p className="text-center text-meta text-ink-3">{START.avbryt}</p>
            </>
          )}
        </div>
      </footer>
    </div>
  )
}
