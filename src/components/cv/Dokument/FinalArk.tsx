'use client'

/**
 * Målgången som blad (publika provsidan, /cv-mallar/prova). Inloggat
 * (galleriet och byggaren) ritas den i CV-rummets utseende i Final.tsx, med
 * samma innehåll och logik.
 *
 * Nedladdningen är finalen (skissen yta 5, beslut 4): bocken ritas, filen
 * har ett namn, Öppna och Dela som två lika stora knappar, sedan en enda
 * nästa handling: första jobbet som matchar hennes CV (räknat ur titel och
 * ort inom en sekund), annars brevet. Första nedladdningen säljer ingenting.
 * Inga poäng, ingen konfetti. Dela saknas i webbläsaren: knappen göms och
 * Öppna står ensam (copywritern).
 */
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { capture } from '@/lib/analytics/events'
import { coverLetterPrefill } from '@/store/cover-letter-store'
import type { Format, MallKort } from '@/lib/cv/mallar/kontrakt'
import { IkonDela, IkonOppna, IkonPdf, IkonWord } from '@/components/illustrations/MallIkoner'
import Ark from './Ark'
import { FINAL } from './texter'
import type { FinalProps, Traff } from './Final'

/** Första meningen ur annonsen, högst 80 tecken (granskningen P4). */
function skalrad(text: string): string {
  const t = (text ?? '').replace(/\s+/g, ' ').trim()
  if (!t) return ''
  const mening = t.split(/(?<=[.!?])\s/)[0] ?? t
  return mening.length <= 80 ? mening : `${mening.slice(0, 77).replace(/\s+\S*$/, '')}...`
}

export default function FinalArk({ open, onClose, fil, mall, format, sidor, cvId, titel, ort, surface, nasta }: FinalProps) {
  const router = useRouter()
  const [traff, setTraff] = useState<Traff | null | 'vantar'>('vantar')
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
  }, [open, titel, ort])

  useEffect(() => {
    if (!open || traff === 'vantar') return
    capture('beloning_visad', { template: mall.id, tier, format, nasta: traff ? 'jobb' : 'brev', surface })
    // En gång per final.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, traff === 'vantar'])

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

  const harTraff = traff && traff !== 'vantar'

  return (
    <Ark open={open} onClose={onClose} rubrik={<span className="sr-only">{FINAL.klar}</span>}>
      <style>{".dok-bock{stroke-dasharray:24;stroke-dashoffset:24;animation:dokBock .45s ease-out .15s forwards}@keyframes dokBock{to{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){.dok-bock{animation:none;stroke-dashoffset:0}}"}</style>
      <div className="grid gap-3 pb-1 text-center">
        <div className="mx-auto mt-1 flex h-16 w-16 items-center justify-center rounded-full bg-positiv-mjuk text-positiv">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" className="dok-bock" />
          </svg>
        </div>
        <p className="font-display text-xl font-bold text-ink-1">{FINAL.klar}</p>
        <p className="inline-flex items-center justify-center gap-1.5 text-[13px] text-ink-2">
          {format === 'docx' ? <IkonWord size={16} /> : <IkonPdf size={16} />}
          {FINAL.fil(fil.filnamn, mall.namn, sidor)}
        </p>
        <div className={`grid gap-2 ${kanDela ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button
            type="button"
            onClick={oppna}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(180deg,#E8863B,var(--koppar)_60%,var(--koppar-djup))] text-sm font-semibold text-koppar-text"
          >
            <IkonOppna size={18} />
            {FINAL.oppna}
          </button>
          {kanDela ? (
            <button
              type="button"
              onClick={() => void dela()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-kant-stark bg-papper text-sm font-semibold text-ink-1"
            >
              <IkonDela size={18} />
              {FINAL.dela}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 min-h-[156px] border-t border-kant pt-3">
        {nasta === 'analys' ? (
          <div className="grid gap-2.5 text-left">
            <p className="text-ey uppercase text-ink-3">{FINAL.nastaSteg}</p>
            <div className="grid gap-2 rounded-xl border border-kant p-3">
              <p className="font-display text-base font-bold text-ink-1">{FINAL.analysRubrik}</p>
              <p className="text-[13px] leading-5 text-ink-2">{FINAL.analysRad}</p>
              <button
                type="button"
                onClick={() => {
                  capture('nasta_steg_klickad', { target: 'analys', template: mall.id, surface })
                  router.push('/dashboard/cv-analys')
                }}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-ink-1 text-sm font-semibold text-papper"
              >
                {FINAL.analysKnapp}
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6">
              <button
                type="button"
                onClick={() => tillBrev(null)}
                className="inline-flex min-h-11 items-center text-[13px] font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
              >
                {FINAL.brevLank}
              </button>
              <button
                type="button"
                onClick={() => {
                  capture('nasta_steg_klickad', { target: 'mina_cv', template: mall.id, surface })
                  router.push('/dashboard/profil/cv')
                }}
                className="inline-flex min-h-11 items-center text-[13px] font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
              >
                {FINAL.minaCv}
              </button>
            </div>
          </div>
        ) : traff === 'vantar' ? (
          <div aria-hidden className="h-[140px] animate-pulse rounded-xl bg-papper-2 motion-reduce:animate-none" />
        ) : harTraff ? (
          <div className="grid gap-2.5">
            <p className="text-ey uppercase text-ink-3">{FINAL.forstaJobbet}</p>
            {/* Kortet är nästa steg (affärsgranskningen R5): annonsen i ny flik,
                annars Dina matchningar. En rad ur annonsen (P4). */}
            <a
              href={traff.url ?? '/dashboard/jobbmatchning'}
              target={traff.url ? '_blank' : undefined}
              rel={traff.url ? 'noopener noreferrer' : undefined}
              aria-label={FINAL.jobbEtikett(traff.rubrik, [traff.arbetsgivare, traff.ort].filter(Boolean).join(', '), Boolean(traff.url))}
              onClick={() => capture('nasta_steg_klickad', { target: 'jobb', template: mall.id, surface })}
              className="grid gap-1 rounded-xl border border-kant p-3 text-left hover:border-ink-1"
            >
              <span className="text-[15px] font-semibold text-ink-1">{traff.rubrik}</span>
              <span className="text-[13px] text-ink-2">{[traff.arbetsgivare, traff.ort].filter(Boolean).join(', ')}</span>
              {skalrad(traff.beskrivning) ? <span className="text-[13px] text-ink-3">{skalrad(traff.beskrivning)}</span> : null}
            </a>
            <button
              type="button"
              onClick={() => {
                capture('nasta_steg_klickad', { target: 'fler_jobb', template: mall.id, surface })
                router.push('/dashboard/jobbmatchning')
              }}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-kant-stark bg-papper text-sm font-semibold text-ink-1"
            >
              {FINAL.flerJobb}
            </button>
            <button
              type="button"
              onClick={() => tillBrev(traff)}
              className="inline-flex min-h-11 items-center justify-center text-[13px] font-medium text-ink-1 underline decoration-kant-stark underline-offset-4"
            >
              {FINAL.brevTillAnnons}
            </button>
          </div>
        ) : (
          <div className="grid gap-2.5 text-left">
            <p className="font-display text-base font-bold text-ink-1">{FINAL.brevRubrik}</p>
            <p className="text-[13px] text-ink-2">{FINAL.brevRad}</p>
            <button
              type="button"
              onClick={() => tillBrev(null)}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-ink-1 text-sm font-semibold text-papper"
            >
              {FINAL.brevKnapp}
            </button>
          </div>
        )}
      </div>
    </Ark>
  )
}
