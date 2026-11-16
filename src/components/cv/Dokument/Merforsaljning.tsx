'use client'

/**
 * Merförsäljningen vid andra nedladdningen (skissen yta 5 bild 3, trions
 * beslut om punkt 14): tre kort med bild av hennes eget CV i andra mallar,
 * vad som skiljer i högst fyra ord (MallKort.kort), mallnamnet i liten text.
 * Tryck väljer kort, en knapp under, "Nej tack" som väg ut. Hennes nuvarande
 * mall visas aldrig; "Allt på en sida" bara om CV:t är längre än en sida.
 *
 * Urvalet läser katalogens fält, aldrig namn: Premium, finns som Word (inga
 * konstnärliga, Word-köparen blir besviken), olika formfamiljer, fotomallar
 * först när CV:t har foto (utbudets avsnitt 6).
 */
import { useEffect, useMemo, useState } from 'react'
import { capture } from '@/lib/analytics/events'
import type { MallKort } from '@/lib/cv/mallar/kontrakt'
import { medSkala } from './matning'
import { forhandsvisningHtml, type Kalla } from './hooks'
import Ark from './Ark'
import { MERFORSALJNING } from './texter'

export function merforsaljningsUrval(katalog: readonly MallKort[], nuvarande: string, sidor: number, harFoto: boolean): MallKort[] {
  const kandidater = katalog.filter((m) => m.id !== nuvarande && m.niva === 'premium' && m.familj !== 'konstnarlig')
  const enSida = sidor > 1 ? kandidater.find((m) => /en sida|kompakt|tät/i.test(`${m.kort} ${m.stil}`)) : undefined
  const ordnade = [...kandidater].sort((a, b) => {
    const p = (m: MallKort) => (m.word ? 2 : 0) + (harFoto && m.foto ? 1 : 0) + (!harFoto && !m.foto ? 1 : 0)
    return p(b) - p(a)
  })
  const ut: MallKort[] = []
  const familjer = new Set<string>()
  for (const m of ordnade) {
    if (ut.length >= (enSida ? 2 : 3)) break
    if (m.id === enSida?.id || familjer.has(m.familj)) continue
    ut.push(m)
    familjer.add(m.familj)
  }
  for (const m of ordnade) {
    if (ut.length >= (enSida ? 2 : 3)) break
    if (!ut.includes(m) && m.id !== enSida?.id) ut.push(m)
  }
  if (enSida) ut.push(enSida)
  return ut
}

export interface MerforsaljningProps {
  open: boolean
  onClose: () => void
  katalog: readonly MallKort[]
  nuvarande: MallKort
  filnamn: string
  sidor: number
  harFoto: boolean
  /** Källan för hennes CV, med mallen utbytt per kort. */
  kalla: (mall: string) => Exclude<Kalla, { typ: 'exempel' }>
  pris: string
  /** Kampanjpris och ordinarie under kampanjen. */
  kampanj?: { pris: string; ordinarie: string } | null
  onKop: (mall: MallKort) => void
  surface: string
}

export default function Merforsaljning({ open, onClose, katalog, nuvarande, filnamn, sidor, harFoto, kalla, pris, kampanj, onKop, surface }: MerforsaljningProps) {
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
      <div className="grid gap-2.5" role="radiogroup" aria-label={MERFORSALJNING.rubrik}>
        {urval.map((m, i) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={vald === i}
            onClick={() => {
              setVald(i)
              capture('merforsaljning_klick', { template: m.id, position: i, val: 'kort', surface })
            }}
            className={`flex items-center gap-3 rounded-xl bg-papper p-2.5 text-left ${vald === i ? 'border-2 border-koppar' : 'border border-kant'}`}
          >
            <span className="relative block aspect-[210/297] w-16 shrink-0 overflow-hidden rounded-[3px] border border-kant bg-white">
              {bilder[m.id] ? (
                <iframe srcDoc={bilder[m.id]} title={m.namn} tabIndex={-1} scrolling="no" className="pointer-events-none absolute inset-0 h-full w-full border-0" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.bild.liten} alt="" className="absolute inset-0 h-full w-full object-cover object-top" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink-1">{m.kort}</span>
              <span className="block text-meta text-ink-3">{m.namn}</span>
            </span>
          </button>
        ))}
      </div>
    </Ark>
  )
}
