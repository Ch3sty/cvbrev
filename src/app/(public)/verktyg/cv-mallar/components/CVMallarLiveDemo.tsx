'use client'

/**
 * Mallväljaren i heron på /verktyg/cv-mallar: exempel-CV:t (Erik Lindberg)
 * renderat på riktigt i vald mall och valt typsnitt, med alla mallar ur
 * registret att välja bland. Ersätter streckskissen (ägaren 2026-09-24:
 * "visa exakt hur de ser ut på riktigt").
 *
 * Farten: dokumentet ritas på servern av /api/public/exempel/cv, samma
 * mallmotor som PDF:en och som artiklarnas mallvisning, och visas i en
 * iframe. Varken mallregistret eller mallmotorn följer med till klienten;
 * listorna kommer som props i sin minsta form från sidan. Första vyn
 * (Norrsken i Calibri) står i HTML och syns utan JavaScript. Iframen har
 * A4-proportionen från början, så inget flyttar sig när dokumentet kommer.
 *
 * Valet följer med in i /cv-mallar/start: panelens knapp och heroknappen
 * "Bygg ditt CV gratis" (data-cta="cv-mallar-bygg") pekar på vald mall.
 */

import { useCallback, useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface DemoMall {
  id: string
  name: string
  description: string
  tier: 'free' | 'premium'
}

export interface DemoTypsnitt {
  id: string
  name: string
}

interface CVMallarLiveDemoProps {
  mallar: readonly DemoMall[]
  typsnitt: readonly DemoTypsnitt[]
  /** Optgruppens namn för de betalda mallarna: "I CV-paketet". */
  paketGrupp: string
  /** Etiketten för en betald mall: "Ingår i CV-paketet, 79 kr i veckan". */
  paketRad: string
}

/** Heroknappen som ska bära valet: data-cta på VerktygsSidas primärknapp i page.tsx. */
const BYGG_CTA = 'cv-mallar-bygg'

const FALT =
  'h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-sm text-ink-1 shadow-insunken focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1'

const PIL =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-kant text-ink-2 transition-colors hover:border-kant-stark hover:text-ink-1'

function startHref(mall: string, typsnitt: string) {
  return `/cv-mallar/start?mall=${encodeURIComponent(mall)}&typsnitt=${encodeURIComponent(typsnitt)}`
}

export default function CVMallarLiveDemo({ mallar, typsnitt, paketGrupp, paketRad }: CVMallarLiveDemoProps) {
  const router = useRouter()
  const mallFalt = useId()
  const [idx, setIdx] = useState(0)
  const [font, setFont] = useState(typsnitt[0]?.id ?? 'calibri')
  const vald = mallar[idx] ?? mallar[0]
  const href = startHref(vald?.id ?? 'norrsken', font)
  const src = `/api/public/exempel/cv?mall=${encodeURIComponent(vald?.id ?? 'norrsken')}&typsnitt=${encodeURIComponent(font)}`

  // Heroknappen ligger i VerktygsSida, utanför den här komponenten. Next:s
  // Link navigerar till sin href-prop, så vi byter både attributet (för
  // mellanklick och kopierad länk) och själva navigeringen. Lyssnaren sitter
  // på elementet och hinner före Reacts klick vid roten; preventDefault gör
  // att Link låter bli.
  useEffect(() => {
    const knapp = document.querySelector<HTMLAnchorElement>(`a[data-cta="${BYGG_CTA}"]`)
    if (!knapp) return
    knapp.setAttribute('href', href)
    const klick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      router.push(href)
    }
    knapp.addEventListener('click', klick)
    return () => knapp.removeEventListener('click', klick)
  }, [href, router])

  const bladdra = useCallback(
    (steg: number) => setIdx((i) => (i + steg + mallar.length) % mallar.length),
    [mallar.length]
  )

  if (!vald) return null
  const gratis = mallar.filter((m) => m.tier === 'free')
  const betalda = mallar.filter((m) => m.tier === 'premium')

  return (
    <div className="w-full rounded-xl border border-kant bg-panel p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-steg font-semibold uppercase tracking-[0.08em] text-ink-3">Välj din mall</p>
        <p className="text-meta tabular-nums text-ink-3">
          {idx + 1} av {mallar.length}
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,11rem)]">
        <div className="min-w-0">
          <label htmlFor={mallFalt} className="mb-1 block text-sm font-medium text-ink-2">
            Mall
          </label>
          <div className="flex gap-2">
            <button type="button" className={PIL} onClick={() => bladdra(-1)} aria-label="Föregående mall">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <select
              id={mallFalt}
              className={`${FALT} min-w-0`}
              value={vald.id}
              onChange={(e) => {
                const i = mallar.findIndex((m) => m.id === e.target.value)
                if (i >= 0) setIdx(i)
              }}
            >
              <optgroup label="Gratis">
                {gratis.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label={paketGrupp}>
                {betalda.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <button type="button" className={PIL} onClick={() => bladdra(1)} aria-label="Nästa mall">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
        <label className="block min-w-0">
          <span className="mb-1 block text-sm font-medium text-ink-2">Typsnitt</span>
          <select className={FALT} value={font} onChange={(e) => setFont(e.target.value)}>
            {typsnitt.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Dokumentet är papper: vit bakgrund är designsystemets undantag för
          mallförhandsvisning (§10). Nyckeln monterar om iframen vid byte, så
          bytet inte hamnar i webbläsarens historik. */}
      <div className="mt-4 overflow-hidden rounded-lg border border-kant bg-white">
        <iframe
          key={src}
          src={src}
          title={`Exempel-CV i mallen ${vald.name}`}
          loading="lazy"
          className="block aspect-[794/1123] w-full"
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-ink-1">
          {vald.name}
          <span className="ml-2 font-normal text-ink-3">{vald.tier === 'premium' ? paketRad : 'Gratis'}</span>
        </p>
        <p className="mt-1 text-sm leading-[22px] text-ink-2">{vald.description}</p>
      </div>

      <Link
        href={href}
        data-cta="cv-mallar-anvand"
        className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-ink-1 px-5 text-sm font-semibold text-white transition-colors hover:bg-ink-hover"
      >
        Använd mallen {vald.name}
      </Link>
    </div>
  )
}
