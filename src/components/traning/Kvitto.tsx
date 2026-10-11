'use client'

/**
 * K1: milstolpekvittot (spec-rummen 4.4 Kvitto, konceptets K1).
 *
 * Helskärm på väggen utan radie: märket 132 px landar på 600 ms och står
 * sedan stilla, eyebrow med datumet i koppar-ljus, märkets namn som rubrik,
 * en mening, och glasknappen tillbaka i full bredd (det enda stället glas
 * får vara fullbrett, spec 16.3.1). Ingen konfetti, inget ljud, ingen
 * delning. Visas en gång: kvittot markeras visat (visad_at) när det ritats,
 * och milstolpe_kvitto_visat skickas.
 *
 * Kvittot visas aldrig i Jobbsöket, Bli upptäckt eller mot rekryterare.
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { IkonX } from '@/components/illustrations/RumSymboler'
import { capture } from '@/lib/analytics/events'
import { RUM_NAMN } from '@/lib/rum/copy'
import { TRANING_HREF } from '@/lib/traning/klient'
import { PASS_COPY } from '@/lib/traning/pass-copy'
import type { Kvitto as KvittoData } from '@/lib/traning/resultat'
import Marke, { MARKE_FOR } from './Marke'
import { useFlodeLage } from './PassShell'

export interface KvittoProps {
  data: KvittoData
  /** Markera visad på servern. Av i förhandsvisningen. */
  markera?: boolean
}

export default function Kvitto({ data, markera = true }: KvittoProps) {
  const footerRef = useRef<HTMLElement | null>(null)
  useFlodeLage(footerRef, false)

  useEffect(() => {
    capture('milstolpe_kvitto_visat', { nyckel: data.nyckel })
    if (!markera) return
    void fetch('/api/traning/milstolpe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nyckel: data.nyckel }),
    }).catch(() => {
      // Kvittot visas igen nästa gång. Inget att säga till användaren.
    })
  }, [data.nyckel, markera])

  return (
    <div className="motion fixed inset-0 z-50 flex flex-col lg:left-[248px]" data-kvitto>
      <div className="vagg flex flex-1 flex-col !rounded-none px-4 pb-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col">
          <div className="-mx-1 flex h-[60px] items-center lg:h-[72px]">
            <span className="min-w-0 flex-1 truncate font-display text-[15px] font-bold tracking-[-.01em] text-vagg-ink">
              {RUM_NAMN.tran}
            </span>
            <Link
              href={TRANING_HREF}
              aria-label={PASS_COPY.topp.stang}
              className="-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-[10px] text-vagg-ink"
            >
              <IkonX />
            </Link>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
            <Marke typ={MARKE_FOR[data.nyckel]} storlek={132} title={PASS_COPY.kvitto.markeAria(data.namn)} landa />
            <p className="mt-7 text-ey text-koppar-ljus">{data.eyebrow}</p>
            <h1 className="text-h1 mt-2 font-display font-extrabold text-vagg-ink">{data.namn}</h1>
            <p className="mt-3 max-w-[32ch] text-[15px] leading-[23px] text-vagg-mjuk">{data.mening}</p>
          </div>
          <div className="pb-[env(safe-area-inset-bottom)]">
            <Link
              href={TRANING_HREF}
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-vagg-kant bg-white/[.08] px-[18px] text-[15px] font-semibold text-vagg-ink"
            >
              {PASS_COPY.kvitto.tillbaka}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
