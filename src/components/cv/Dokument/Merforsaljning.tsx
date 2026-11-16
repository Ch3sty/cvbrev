'use client'

/**
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
import { MERFORSALJNING_URVAL, arSaljbar } from '@/lib/cv/mallval/forslag'

/**
 * Urvalet: den handplockade tabellen (MERFORSALJNING_URVAL i forslag.ts) för
 * foto och nuvarande mall, Not som tredje kort när CV:t är längre än en
 * sida, sedan reservlistan och sist poängregeln. Fasta regler som filter:
 * aldrig nuvarande mall, bara Premium med Word, aldrig konstnärlig, och med
 * foto bara mallar med fotoplats.
 */
export function merforsaljningsUrval(katalog: readonly MallKort[], nuvarande: string, sidor: number, harFoto: boolean): MallKort[] {
  const T = MERFORSALJNING_URVAL
  // Det kompakta kortet (Not) gäller alla fall, också med foto (beslutets avsnitt 2).
  const ok = (m: MallKort | undefined): m is MallKort =>
    Boolean(m) && m!.id !== nuvarande && arSaljbar(m!) && (!harFoto || m!.foto || (sidor > 1 && m!.id === T.enSida))
  const perId = new Map(katalog.map((m) => [m.id, m]))
  const bas = harFoto ? (nuvarande === 'bjork' ? T.medFotoBjork : T.medFotoLinne) : T.utanFoto
  const lista = bas.map((id) => perId.get(id))
  if (sidor > 1) lista[2] = perId.get(T.enSida)
  const ut: MallKort[] = []
  const lagg = (m: MallKort | undefined) => {
    if (ut.length < 3 && ok(m) && !ut.includes(m)) ut.push(m)
  }
  lista.forEach(lagg)
  ;(harFoto ? T.reserv.medFoto : T.reserv.utanFoto).forEach((id) => lagg(perId.get(id)))
  if (ut.length < 3) for (const m of merforsaljningsPoang(katalog, nuvarande, sidor, harFoto)) lagg(m)
  // Det kompakta kortet (Not) står sist, som tredje kortet.
  const enSida = sidor > 1 ? ut.find((m) => m.id === T.enSida) : undefined
  return enSida ? [...ut.filter((m) => m !== enSida), enSida] : ut
}

/** Poängregeln före utbud 2, nu reserv när tabellen inte räcker. */
function merforsaljningsPoang(katalog: readonly MallKort[], nuvarande: string, sidor: number, harFoto: boolean): MallKort[] {
  const kandidater = katalog.filter((m) => m.id !== nuvarande && m.niva === 'premium' && m.familj !== 'konstnarlig')
  const enSida = sidor > 1 ? kandidater.find((m) => /en sida|kompakt|tät/i.test(`${m.kort} ${m.stil}`)) : undefined
  // Sidospalter säljer bäst (utbudets avsnitt 6); med foto väger fotoplatsen in.
  const poang = (m: MallKort) => (m.familj === 'sidospalt' ? 3 : 0) + (harFoto && m.foto ? 2 : 0) + (m.word ? 1 : 0)
  const ordnade = kandidater
    .map((m, i) => ({ m, i }))
    .sort((a, b) => poang(b.m) - poang(a.m) || a.i - b.i)
    .map((x) => x.m)
  // Med foto: olika form (familj och fotoplats) i varje kort, så att valen skiljer sig.
  const nyckel = (m: MallKort) => (harFoto ? `${m.familj}:${m.foto}` : m.id)
  const antal = enSida ? 2 : 3
  const ut: MallKort[] = []
  const sedda = new Set<string>()
  for (const m of ordnade) {
    if (ut.length >= antal) break
    if (m.id === enSida?.id || sedda.has(nyckel(m))) continue
    ut.push(m)
    sedda.add(nyckel(m))
  }
  for (const m of ordnade) {
    if (ut.length >= antal) break
    if (!ut.includes(m) && m.id !== enSida?.id) ut.push(m)
  }
  if (enSida) ut.push(enSida)
  return ut
}

/**
 * Vad som skiljer, i högst fyra ord. Saknar CV:t foto lovar kortet inget foto
 * (affärsgranskningen R2): katalogens kortUtanFoto om mallsystemet har det,
 * annars stryks fotoledet ur texten.
 */
export function kortText(m: MallKort, harFoto: boolean): string {
  if (harFoto || !m.foto) return m.kort
  const utan = m.kortUtanFoto
  if (utan) return utan
  const t = m.kort.replace(/,?\s*(och |med ditt |med |rund )?(foto|fotoplats|rund bild|bild)$/i, '').trim()
  return t || m.kort
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
