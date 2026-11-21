'use client'

/**
 * Merförsäljningen som blad (publika provsidan, /cv-mallar/prova). Inloggat
 * (galleriet och byggaren) ritas den i CV-rummets utseende i Merforsaljning.tsx;
 * urvalet och texterna är desamma.
 *
 * Merförsäljningen vid andra nedladdningen (skissen yta 5 bild 3, trions
 * beslut om punkt 14): tre kort med bild av hennes eget CV i andra mallar,
 * vad som skiljer i högst fyra ord (MallKort.kort), mallnamnet i liten text.
 * Tryck väljer kort, en knapp under, "Nej tack" som väg ut. Hennes nuvarande
 * mall visas aldrig; den kompakta mallen som tredje kort bara om CV:t är längre än en sida.
 *
 * Urvalet är handplockat (docs/design/mallar-2-forslag-saas-lead.md):
 * Premium med Word (inga konstnärliga, Word-köparen blir besviken), bara
 * fotomallar när CV:t har foto. Mallnamnet står som "Mallen Not", eftersom
 * flera namn är vanliga ord.
 */
import { useEffect, useMemo, useState } from 'react'
import { capture } from '@/lib/analytics/events'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { medSkala } from './matning'
import { forhandsvisningHtml, type Kalla } from './hooks'
import Ark from './Ark'
import { MERFORSALJNING } from './texter'
import { merforsaljningsUrval, kortText, type MerforsaljningProps } from './Merforsaljning'

export default function MerforsaljningArk({ open, onClose, katalog, nuvarande, filnamn, sidor, harFoto, kalla, pris, kampanj, onKop, surface }: MerforsaljningProps) {
  const urval = useMemo(() => merforsaljningsUrval(katalog, nuvarande.id, sidor, harFoto), [katalog, nuvarande.id, sidor, harFoto])
  const [vald, setVald] = useState(0)
  const [bilder, setBilder] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    capture('merforsaljning_visad', { template: nuvarande.id, templates: urval.map((m) => m.id).join(','), surface })
    let levande = true
    for (const m of urval) {
      void forhandsvisningHtml(kalla(m.id)).then((h) => {
        if (levande && h) setBilder((b) => ({ ...b, [m.id]: medSkala(h) }))
      })
    }
    return () => {
      levande = false
    }
    // Urvalet och källan räcker en gång per öppning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const valdMall = urval[vald]
  if (!valdMall) return null
  const visatPris = kampanj?.pris ?? pris

  return (
    <Ark
      open={open}
      onClose={onClose}
      rubrik={MERFORSALJNING.rubrik}
      under={MERFORSALJNING.under(filnamn, nuvarande.namn, urval.length)}
      fot={
        <div className="grid gap-2">
          <p className="text-meta text-ink-3">{MERFORSALJNING.wordRad}</p>
          <button
            type="button"
            onClick={() => {
              capture('merforsaljning_klick', { template: valdMall.id, position: vald, val: 'kop', surface })
              onKop(valdMall)
            }}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#E8863B,var(--koppar)_60%,var(--koppar-djup))] px-4 py-2 text-center text-sm font-semibold leading-tight text-koppar-text"
          >
            {MERFORSALJNING.knapp(valdMall.namn, visatPris)}
          </button>
          {kampanj ? <p className="text-center text-meta text-ink-3">{MERFORSALJNING.kampanj(kampanj.pris, kampanj.ordinarie)}</p> : null}
          <button
            type="button"
            onClick={() => {
              capture('merforsaljning_klick', { template: nuvarande.id, position: -1, val: 'nej', surface })
              onClose()
            }}
            className="inline-flex min-h-11 items-center justify-center text-[13px] font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
          >
            {MERFORSALJNING.nejTack(nuvarande.namn)}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={MERFORSALJNING.rubrik}>
        {urval.map((m, i) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={vald === i}
            aria-label={`${kortText(m, harFoto)}. ${MERFORSALJNING.mallnamn(m.namn)}`}
            onClick={() => {
              setVald(i)
              capture('merforsaljning_klick', { template: m.id, position: i, val: 'kort', surface })
            }}
            className={`flex min-w-0 flex-col items-center gap-2 rounded-xl bg-papper p-1.5 text-center ${vald === i ? 'border-2 border-koppar' : 'border border-kant'}`}
          >
            <span className="relative block aspect-[210/297] w-full max-w-[112px] shrink-0 overflow-hidden rounded-[3px] border border-kant bg-white">
              {bilder[m.id] ? (
                <iframe srcDoc={bilder[m.id]} title={m.namn} tabIndex={-1} scrolling="no" className="pointer-events-none absolute inset-0 h-full w-full border-0" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.bild.liten} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold leading-tight text-ink-1">{kortText(m, harFoto)}</span>
              <span className="block text-meta text-ink-3">{MERFORSALJNING.mallnamn(m.namn)}</span>
            </span>
          </button>
        ))}
      </div>
    </Ark>
  )
}
