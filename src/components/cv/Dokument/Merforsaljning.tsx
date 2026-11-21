'use client'

/**
 * Merförsäljningen i CV-rummets utseende (omgång 1, steg 2, byggspecen
 * avsnitt 9): samma ram som spärrarna vid nedladdning, med hennes CV i den
 * valda mallen till vänster (överst på telefonen) och korten, knappen och
 * "Nej tack" till höger. Urval, texter, ordning och mätning som förut. Den
 * publika provsidan ritar bladet i MerforsaljningArk.tsx.
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
import Sheet from '@/components/shell/Sheet'
import { begarEgnaMallar, type EgetCv } from './egnaMallar'
import EgenMiniatyr from './EgenMiniatyr'
import type { Kalla } from './hooks'
import { MERFORSALJNING } from './texter'
import { SPARR } from '@/components/cv/rum3/texter'
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

/** Hennes CV ur källan, för miniatyrerna (inloggat). */
function egetCvUr(k: Exclude<Kalla, { typ: 'exempel' }>): EgetCv | null {
  if (k.typ !== 'inloggad') return null
  return { cvId: k.cvId ?? '', structuredData: k.structuredData, cvText: k.cvText, val: k.val }
}

export default function Merforsaljning({ open, onClose, katalog, nuvarande, filnamn, sidor, harFoto, kalla, pris, kampanj, onKop, surface }: MerforsaljningProps) {
  const urval = useMemo(() => merforsaljningsUrval(katalog, nuvarande.id, sidor, harFoto), [katalog, nuvarande.id, sidor, harFoto])
  const [vald, setVald] = useState(0)
  const cv = useMemo(() => egetCvUr(kalla(nuvarande.id)), [kalla, nuvarande.id])

  useEffect(() => {
    if (!open) return
    capture('merforsaljning_visad', { template: nuvarande.id, templates: urval.map((m) => m.id).join(','), surface })
    // Alla tre korten i en fråga (egnaMallar), direkt.
    if (cv) begarEgnaMallar(cv, urval.map((m) => m.id), true)
    // Urvalet och källan räcker en gång per öppning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const valdMall = urval[vald]
  if (!valdMall) return null
  const visatPris = kampanj?.pris ?? pris
  const nej = () => {
    capture('merforsaljning_klick', { template: nuvarande.id, position: -1, val: 'nej', surface })
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} bare className="cv3s-sheet sm:!max-w-[1020px] sm:!rounded-[28px] !border-0 sm:max-h-[94dvh]">
      {open ? (
        <div className="cv3s" data-merforsaljning>
          <div className="cv3s-vagg">
            <span className="cv3s-cirkel" aria-hidden="true" />
            <span className="cv3s-kulle" aria-hidden="true" />
            <div className="cv3s-vagg-topp">
              <div className="min-w-0">
                <p className="cv3s-ogon-vagg">{SPARR.ditt(valdMall.namn)}</p>
                <span className="cv3s-fm-rad md:hidden">
                  <span className="cv3s-fm">PDF</span>
                  {valdMall.word ? <span className="cv3s-fm">Word</span> : null}
                </span>
              </div>
              <span className="cv3s-fm-rad hidden md:inline-flex">
                <span className="cv3s-fm">PDF</span>
                {valdMall.word ? <span className="cv3s-fm">Word</span> : null}
              </span>
              <button type="button" className="cv3s-stang md:hidden" onClick={onClose} aria-label={SPARR.stang}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="cv3s-ark">
              <EgenMiniatyr key={valdMall.id} mall={valdMall} cv={cv} direkt alt={SPARR.ditt(valdMall.namn)} />
            </div>
          </div>

          <div className="cv3s-text">
            <button type="button" className="cv3s-stang hidden md:flex" onClick={onClose} aria-label={SPARR.stang}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <h2 className="cv3s-rubrik cv3s-rubrik-utan-ogon">{MERFORSALJNING.rubrik}</h2>
            <p className="cv3s-body">{MERFORSALJNING.under(filnamn, nuvarande.namn, urval.length)}</p>

            <div className="cv3s-val" role="radiogroup" aria-label={MERFORSALJNING.rubrik}>
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
                  className="cv3s-valkort"
                >
                  <span className="cv3s-valkort-bild">
                    <EgenMiniatyr mall={m} cv={cv} bild="liten" />
                  </span>
                  <span className="min-w-0">
                    <b>{kortText(m, harFoto)}</b>
                    <small>{MERFORSALJNING.mallnamn(m.namn)}</small>
                  </span>
                </button>
              ))}
            </div>

            <div className="cv3s-fot">
              <p className="cv3s-pris cv3s-pris-liten">{MERFORSALJNING.wordRad}</p>
              <div className="cv3s-kop">
                <button
                  type="button"
                  className="cv3s-stor"
                  onClick={() => {
                    capture('merforsaljning_klick', { template: valdMall.id, position: vald, val: 'kop', surface })
                    onKop(valdMall)
                  }}
                >
                  {MERFORSALJNING.knapp(valdMall.namn, visatPris)}
                </button>
              </div>
              {kampanj ? <p className="cv3s-kampanj">{MERFORSALJNING.kampanj(kampanj.pris, kampanj.ordinarie)}</p> : null}
              <div className="cv3s-lankar cv3s-lankar-mitt">
                <button type="button" className="cv3s-lank" onClick={nej}>
                  {MERFORSALJNING.nejTack(nuvarande.namn)}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Sheet>
  )
}
