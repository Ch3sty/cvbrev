'use client'

/**
 * Målgången i CV-rummets utseende (omgång 1, steg 2, byggspecen avsnitt 9,
 * skissen Nedladdat-1440): en hel vägg i petrol. Till vänster "Klart. Ditt CV
 * är nedladdat." med arket som landar och bocken, filraden, Öppna och Dela
 * (Dela bara när webbläsaren kan dela filer) och dokumentets väg, klar. Till
 * höger ett papper med nästa steg:
 *
 *   Galleriet, med träff   första jobbet som matchar (titel och ort ur CV:t,
 *                          inom en sekund), brevet till annonsen, fler jobb
 *   Galleriet, utan träff  reserven: brevet
 *   Byggaren (nasta)       analysen som nästa steg, brevet och Ditt CV som länkar
 *
 * Samma innehåll, ordning och mätning som förut; första nedladdningen säljer
 * ingenting, inga poäng, ingen konfetti. Den publika provsidan ritar
 * målgången som blad i FinalArk.tsx.
 *
 * Arket: hennes CV i mallen ur galleriets minne (`cv`). Utan det (byggaren)
 * läses arket som redan står på sidan, och finns inget visas filens ikon.
 */
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { coverLetterPrefill } from '@/store/cover-letter-store'
import type { Format, MallKort } from '@/lib/cv/mallar/kontrakt'
import { IkonDela, IkonOppna } from '@/components/illustrations/MallIkoner'
import { ArrowRight, Briefcase, ChevronRight } from '@/components/illustrations/RumIkoner'
import { banaAria, type BanaSteg } from '@/components/cv/rum3/DokumentBana'
import { VAGG } from '@/components/cv/rum3/texter'
import EgenMiniatyr from './EgenMiniatyr'
import type { EgetCv } from './egnaMallar'
import { oppnaDialog } from './dialoglager'
import { DOK, FINAL } from './texter'

export interface Traff {
  id: string | null
  rubrik: string
  arbetsgivare: string
  ort: string
  url: string | null
  beskrivning: string
}

/** Första meningen ur annonsen, högst 80 tecken (granskningen P4). */
function skalrad(text: string): string {
  const t = (text ?? '').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  const mening = t.split(/(?<=[.!?])\s/)[0] ?? t
  return mening.length <= 80 ? mening : `${mening.slice(0, 77).replace(/\s+\S*$/, '')}...`
}

export interface FinalProps {
  open: boolean
  onClose: () => void
  fil: { blob: Blob; url: string; filnamn: string }
  mall: MallKort
  format: Format
  sidor: number
  /** Inloggad: CV:ts id, för brevet. */
  cvId?: string | null
  /** Titel och ort ur CV:t, för träffen. */
  titel?: string
  ort?: string
  surface: string
  /**
   * CV-byggaren (skissen 2026-11-16, yta 5): nästa steg är analysen av
   * CV:t, sedan brevet och Ditt CV som länkar, i stället för jobbträffen.
   */
  nasta?: 'analys'
  /** Hennes CV för arket (galleriet). Utelämnat: arket som står på sidan. */
  cv?: EgetCv | null
  /** Dokumentets väg som den är; nedladdat är alltid klart. Utelämnad: uppladdat och nedladdat. */
  vag?: { uppladdat: 'uppladdat' | 'utkast'; analyserat: boolean; atgardat: boolean } | null
}

/** Dokumentets väg som rak rad (skissen Nedladdat-1440): gjort i koppar med bock, flaggan vid nedladdat. */
function Bana({ steg }: { steg: BanaSteg[] }) {
  const X = [16, 94, 172, 250]
  const bock = (x: number, farg: string) => (
    <path d={`M${x - 5.5} 46.5l3.6 3.6 7.4-8`} fill="none" stroke={farg} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  )
  return (
    <svg className="cv3f-bana" viewBox="0 0 300 96" role="img" aria-label={banaAria(steg)}>
      <path d="M16 46H250" stroke="var(--koppar)" strokeWidth="6" strokeLinecap="round" />
      {steg.slice(0, 3).map((s, i) =>
        s.status === 'gjord' ? (
          <g key={i}>
            <circle cx={X[i]} cy="46" r="13" fill="var(--koppar)" />
            {bock(X[i], '#1A1206')}
          </g>
        ) : (
          <circle key={i} cx={X[i]} cy="46" r="11" fill="var(--vagg)" stroke="var(--vagg-svag)" strokeWidth="3" />
        )
      )}
      <path d="M250 46V4" stroke="var(--vagg-ink)" strokeWidth="3" strokeLinecap="round" />
      <path d="M251.5 6h29l-7.5 10.5 7.5 10.5h-29z" fill="var(--koppar)" />
      <circle cx="250" cy="46" r="13" fill="var(--vagg-ink)" />
      {bock(250, 'var(--vagg)')}
      {steg.map((s, i) => (
        <text key={i} x={X[i]} y="84" textAnchor="middle" data-sist={i === 3 ? '' : undefined}>
          {s.etikett}
        </text>
      ))}
    </svg>
  )
}

/** "fredag 21 nov", utan punkter. */
function idag(): string {
  try {
    return new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'short' }).replace(/\./g, '')
  } catch {
    return ''
  }
}

export default function Final({ open, onClose, fil, mall, format, sidor, cvId, titel, ort, surface, nasta, cv, vag }: FinalProps) {
  const router = useRouter()
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  const stang = useRef(onClose)
  stang.current = onClose
  const [traff, setTraff] = useState<Traff | null | 'vantar'>('vantar')
  const [sidansArk, setSidansArk] = useState<string | null>(null)
  const kanDela = useMemo(() => {
    try {
      const f = new File([fil.blob], fil.filnamn, { type: fil.blob.type })
      return typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [f] })
    } catch {
      return false
    }
  }, [fil])
  const tier = mall.niva === 'gratis' ? 'free' : 'premium'

  useEffect(() => {
    if (!open) return
    if (nasta === 'analys' || !titel || titel.trim().length < 2) {
      setTraff(null)
      return
    }
    const ac = new AbortController()
    const t = window.setTimeout(() => ac.abort(), 1200)
    fetch(`/api/cv/forsta-traff?titel=${encodeURIComponent(titel)}&ort=${encodeURIComponent(ort ?? '')}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((j: { traff: Traff | null }) => setTraff(j.traff ?? null))
      .catch(() => setTraff(null))
      .finally(() => window.clearTimeout(t))
    return () => ac.abort()
  }, [open, titel, ort, nasta])

  useEffect(() => {
    if (!open || traff === 'vantar') return
    capture('beloning_visad', { template: mall.id, tier, format, nasta: traff ? 'jobb' : 'brev', surface })
    // En gång per final.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, traff === 'vantar'])

  // Arket som står på sidan (byggaren), när galleriets minne inte skickas med.
  useEffect(() => {
    if (!open || cv) return
    const f = document.querySelector<HTMLIFrameElement>('.dok-ark-yta iframe')
    setSidansArk(f?.getAttribute('srcdoc') ?? null)
  }, [open, cv])

  // Dialogen: fokus in och tillbaka, Esc stänger, cookie-raden viker undan.
  useEffect(() => {
    if (!open) return
    const forra = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => ref.current?.focus(), 30)
    const tangent = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      stang.current()
    }
    window.addEventListener('keydown', tangent, true)
    const slapp = oppnaDialog()
    const body = document.body
    const forraOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      slapp()
      window.clearTimeout(t)
      window.removeEventListener('keydown', tangent, true)
      body.style.overflow = forraOverflow
      forra?.focus?.()
    }
  }, [open])

  const oppna = () => {
    capture('fil_delad', { template: mall.id, format, metod: 'oppna', surface })
    window.open(fil.url, '_blank', 'noopener')
  }
  const dela = async () => {
    try {
      const f = new File([fil.blob], fil.filnamn, { type: fil.blob.type })
      await navigator.share({ files: [f], title: fil.filnamn })
      capture('fil_delad', { template: mall.id, format, metod: 'dela', surface })
    } catch {
      // Avbruten delning: hon valde själv, inget att säga.
    }
  }
  const tillBrev = (t: Traff | null) => {
    capture('nasta_steg_klickad', { target: 'brev', template: mall.id, surface })
    if (t && cvId) {
      coverLetterPrefill.set({
        cvId,
        jobTitle: t.rubrik,
        company: t.arbetsgivare,
        jobDescription: t.beskrivning,
        jobAdUrl: t.url ?? undefined,
      })
    }
    router.push('/dashboard/skapa-brev')
  }
  const tillDittCv = () => {
    capture('nasta_steg_klickad', { target: 'mina_cv', template: mall.id, surface })
    router.push('/dashboard/profil/cv')
  }

  if (!open || typeof document === 'undefined') return null

  const harTraff = traff && traff !== 'vantar' ? traff : null
  const steg: BanaSteg[] = [
    { etikett: vag?.uppladdat === 'utkast' ? VAGG.gjord.utkast : VAGG.gjord.uppladdat, status: 'gjord' },
    { etikett: vag?.analyserat ? VAGG.gjord.analyserat : VAGG.kommer.analysera, status: vag?.analyserat ? 'gjord' : 'kvar' },
    { etikett: vag?.atgardat ? VAGG.gjord.atgardat : VAGG.kommer.atgarda, status: vag?.atgardat ? 'gjord' : 'kvar' },
    { etikett: VAGG.gjord.nedladdat, status: 'gjord' },
  ]
  const lank = 'cv3f-lank'

  const hoger =
    nasta === 'analys' ? (
      <>
        <p className="cv3f-ogon">{FINAL.nastaSteg}</p>
        <h2 className="cv3f-h2">{FINAL.analysRubrik}</h2>
        <p className="cv3f-rad">{FINAL.analysRad}</p>
        <div className="cv3f-knappar">
          <button
            type="button"
            className="cv3s-stor"
            data-final-forsta
            onClick={() => {
              capture('nasta_steg_klickad', { target: 'analys', template: mall.id, surface })
              router.push('/dashboard/cv-analys')
            }}
          >
            {FINAL.analysKnapp}
            <ArrowRight size={20} strokeWidth={2.4} />
          </button>
        </div>
        <div className="cv3f-lankar">
          <button type="button" className={lank} onClick={() => tillBrev(null)}>
            {FINAL.brevLank}
          </button>
          <button type="button" className={lank} onClick={tillDittCv}>
            {FINAL.minaCv}
          </button>
        </div>
      </>
    ) : traff === 'vantar' ? (
      <div aria-hidden className="cv3f-vantar" />
    ) : harTraff ? (
      <>
        <p className="cv3f-ogon">{FINAL.forstaJobbet}</p>
        {/* Kortet är nästa steg (affärsgranskningen R5): annonsen i ny flik,
            annars Dina matchningar. En rad ur annonsen (P4). */}
        <a
          href={harTraff.url ?? '/dashboard/jobbmatchning'}
          target={harTraff.url ? '_blank' : undefined}
          rel={harTraff.url ? 'noopener noreferrer' : undefined}
          aria-label={FINAL.jobbEtikett(harTraff.rubrik, [harTraff.arbetsgivare, harTraff.ort].filter(Boolean).join(', '), Boolean(harTraff.url))}
          onClick={() => capture('nasta_steg_klickad', { target: 'jobb', template: mall.id, surface })}
          className="cv3f-jobb"
        >
          <span className="cv3f-jobb-ik">
            <Briefcase size={26} strokeWidth={2.2} />
          </span>
          <span className="min-w-0">
            <b>{harTraff.rubrik}</b>
            <small>{[harTraff.arbetsgivare, harTraff.ort].filter(Boolean).join(', ')}</small>
            {skalrad(harTraff.beskrivning) ? <small className="cv3f-jobb-skal">{skalrad(harTraff.beskrivning)}</small> : null}
          </span>
          <ChevronRight size={20} strokeWidth={2.4} className="ml-auto shrink-0" />
        </a>
        <h2 className="cv3f-h2">{FINAL.brevRubrik}</h2>
        <p className="cv3f-rad">{FINAL.brevRadTraff}</p>
        <div className="cv3f-knappar">
          <button type="button" className="cv3s-stor" data-final-forsta onClick={() => tillBrev(harTraff)}>
            {FINAL.brevTillAnnons}
            <ArrowRight size={20} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className="cv3f-liten"
            onClick={() => {
              capture('nasta_steg_klickad', { target: 'fler_jobb', template: mall.id, surface })
              router.push('/dashboard/jobbmatchning')
            }}
          >
            {FINAL.flerJobb}
          </button>
        </div>
        <div className="cv3f-lankar">
          <button type="button" className={lank} onClick={tillDittCv}>
            {FINAL.tillbakaDittCv}
          </button>
        </div>
      </>
    ) : (
      <>
        <h2 className="cv3f-h2 cv3f-h2-forst">{FINAL.brevRubrik}</h2>
        <p className="cv3f-rad">{FINAL.brevRad}</p>
        <div className="cv3f-knappar">
          <button type="button" className="cv3s-stor" data-final-forsta onClick={() => tillBrev(null)}>
            {FINAL.brevKnapp}
            <ArrowRight size={20} strokeWidth={2.4} />
          </button>
        </div>
        <div className="cv3f-lankar">
          <button type="button" className={lank} onClick={tillDittCv}>
            {FINAL.tillbakaDittCv}
          </button>
        </div>
      </>
    )

  return createPortal(
    <div className="cv3f" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={`${id}-r`} ref={ref} data-final={nasta ?? (harTraff ? 'jobb' : 'brev')}>
      <svg className="cv3f-bakgrund" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <circle cx="1290" cy="-60" r="330" fill="var(--t3-cirkel, #164144)" />
        <path d="M0 900V690C260 640 520 720 800 640S1240 520 1440 560V900Z" fill="var(--t3-kulle-1, #153E41)" />
        <path d="M0 900V790C300 760 620 820 900 760S1300 680 1440 700V900Z" fill="var(--t3-kulle-2, #1B494C)" />
      </svg>
      <button type="button" className="cv3f-stang" onClick={onClose} aria-label={DOK.stang}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className="cv3f-inre">
        <div className="cv3f-vanster">
          <p className="cv3f-ogon-vagg">{FINAL.nedladdat(idag())}</p>
          <h1 id={`${id}-r`} className="cv3f-h1">
            {FINAL.klar}
          </h1>
          <div className="cv3f-rad-ark">
            <div className="cv3f-arkplats">
              <span className="cv3f-ark">
                {cv ? (
                  <EgenMiniatyr mall={mall} cv={cv} direkt alt={FINAL.arkAlt(mall.namn)} />
                ) : sidansArk ? (
                  <span className="cv3-mini" data-egen role="img" aria-label={FINAL.arkAlt(mall.namn)}>
                    <iframe srcDoc={sidansArk} title="" tabIndex={-1} scrolling="no" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="cv3f-ark-tom" aria-hidden="true" />
                )}
              </span>
              <span className="cv3f-bock" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 12.5l5 5L20 6.5" className="dok-bock" />
                </svg>
              </span>
            </div>
            <div className="cv3f-filkol">
              <div className="cv3f-fil">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 3h8l4 4v14H6z" />
                  <path d="M14 3v4h4M9 13h6M9 17h4" />
                </svg>
                <span className="min-w-0">
                  <b>{fil.filnamn}</b>
                  <small>{FINAL.filRad(mall.namn, sidor)}</small>
                </span>
              </div>
              <div className="cv3f-brickor">
                <button type="button" className="cv3f-bricka" onClick={oppna}>
                  <IkonOppna size={18} />
                  {FINAL.oppna}
                </button>
                {kanDela ? (
                  <button type="button" className="cv3f-bricka" onClick={() => void dela()}>
                    <IkonDela size={18} />
                    {FINAL.dela}
                  </button>
                ) : null}
              </div>
              <Bana steg={steg} />
            </div>
          </div>
        </div>
        <div className="cv3f-papper">{hoger}</div>
      </div>
      <style>{'.dok-bock{stroke-dasharray:24;stroke-dashoffset:24;animation:dokBock .45s ease-out .5s forwards}@keyframes dokBock{to{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){.dok-bock{animation:none;stroke-dashoffset:0}}'}</style>
    </div>,
    document.body
  )
}
