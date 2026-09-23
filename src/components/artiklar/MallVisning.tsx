'use client'

/**
 * Mallvisningen i artiklarna: exempel-CV:t eller exempelbrevet i en mall,
 * med mallväljare och typsnittsval (ägarens justering 2026-09-23 i
 * docs/bygg-noter-paket.md: interaktiviteten stannar).
 *
 * Farten: dokumentet renderas på servern av /api/public/exempel/{cv,brev}
 * och visas i en iframe, så varken mallregistret eller mallmotorn följer
 * med till klienten. Den här komponenten är två inbyggda select-fält och
 * en iframe-adress, några hundra byte. Första vyn (Norrsken respektive
 * Klassisk i Calibri) står i HTML och går att se utan JavaScript.
 *
 * MDX-aliasen InteractiveCVShowcase och InteractiveLetterShowcase pekar hit,
 * så de 18 artiklarna ändras inte.
 */

import { useState } from 'react'
import Link from 'next/link'

export interface MallVal {
  id: string
  name: string
  tier: 'free' | 'premium'
}

interface MallVisningProps {
  typ: 'cv' | 'brev'
  mallar: readonly MallVal[]
  typsnitt: readonly { id: string; name: string }[]
  /** Raden under förhandsvisningen. */
  fotrad: string
  lank: { text: string; href: string }
}

const FALT =
  'h-11 w-full rounded-lg border border-kant bg-insunken px-3 text-sm text-ink-1 shadow-insunken focus:border-ink-1 focus:outline-none focus:ring-1 focus:ring-ink-1'

export default function MallVisning({ typ, mallar, typsnitt, fotrad, lank }: MallVisningProps) {
  const [mall, setMall] = useState(mallar[0]?.id ?? '')
  const [font, setFont] = useState(typsnitt[0]?.id ?? 'calibri')
  const vald = mallar.find((m) => m.id === mall)
  const src = `/api/public/exempel/${typ}?mall=${encodeURIComponent(mall)}&typsnitt=${encodeURIComponent(font)}`
  const namn = typ === 'cv' ? 'CV' : 'personligt brev'

  return (
    <aside className="not-prose my-10 rounded-xl border border-kant bg-panel p-4 sm:p-6" aria-label={`Exempel på ${namn} i våra mallar`}>
      <p className="text-steg uppercase text-ink-3">
        Så ser ett färdigt {namn} ut i mallen {vald?.name}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink-2">Mall</span>
          <select className={FALT} value={mall} onChange={(e) => setMall(e.target.value)}>
            <optgroup label="Gratis">
              {mallar
                .filter((m) => m.tier === 'free')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="I CV-paketet">
              {mallar
                .filter((m) => m.tier === 'premium')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </optgroup>
          </select>
        </label>
        <label className="block">
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

      <div className="mx-auto mt-4 max-w-[560px] overflow-hidden rounded-lg border border-kant bg-panel">
        <iframe
          key={src}
          src={src}
          title={`Exempel på ${namn} i mallen ${vald?.name ?? ''}`}
          loading="lazy"
          className="block aspect-[794/1123] w-full"
        />
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-2">{fotrad}</p>
        <Link
          href={lank.href}
          data-cta-klick={lank.href}
          className="text-sm font-medium text-ink-1 underline decoration-kant-stark underline-offset-4 hover:decoration-ink-1"
        >
          {lank.text}
        </Link>
      </div>
    </aside>
  )
}
