'use client'

/**
 * Dela resultatet: på mobil öppnar knappen telefonens delningsmeny (Web Share
 * API), annars kopieras länken. Länken bär parametrarna i query-strängen, så
 * den som öppnar den ser samma uträkning, och i chattar och sociala medier
 * visas resultatets OG-bild (/api/og/rakna-ut/<slug>).
 *
 * Går varken delning eller kopiering visas länken markerad i ett fält, så
 * att den går att kopiera för hand. Avbruten delning är inget fel.
 *
 * Bädda in-panelen ligger här också: en textlänk på bläckytan fäller ut
 * koden under resultatet. Den döljs när kalkylatorn själv visas i en iframe.
 */
import { useEffect, useRef, useState } from 'react'
import { INK_KNAPP, INK_LANK } from '@/components/shell/InkPanel'
import { FALT_INPUT } from './ui'

type Lage = 'vilar' | 'kopierad' | 'delad' | 'manuell'

export function arMobilDelning(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false
  try {
    return window.matchMedia('(pointer: coarse)').matches
  } catch {
    return false
  }
}

export default function DelaResultat({ url, text, titel }: { url: string; text: string; titel: string }) {
  const [lage, setLage] = useState<Lage>('vilar')
  const falt = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (lage === 'kopierad' || lage === 'delad') {
      const t = setTimeout(() => setLage('vilar'), 2500)
      return () => clearTimeout(t)
    }
    if (lage === 'manuell') falt.current?.select()
  }, [lage])

  // Byter parametrarna medan användaren räknar vidare gäller en ny länk.
  useEffect(() => {
    setLage((l) => (l === 'manuell' ? 'vilar' : l))
  }, [url])

  async function kopiera() {
    try {
      await navigator.clipboard.writeText(url)
      setLage('kopierad')
    } catch {
      setLage('manuell')
    }
  }

  async function dela() {
    if (arMobilDelning()) {
      try {
        await navigator.share({ title: titel, text, url })
        setLage('delad')
        return
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') return
      }
    }
    await kopiera()
  }

  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto">
      <button type="button" onClick={dela} className={INK_KNAPP} data-cta="rakna-dela">
        {lage === 'kopierad' ? 'Länken är kopierad' : 'Dela resultatet'}
      </button>
      <p role="status" aria-live="polite" className="text-meta text-ink-1-mjuk empty:hidden">
        {lage === 'kopierad' ? 'Den som öppnar länken ser samma uträkning.' : ''}
      </p>
      {lage === 'manuell' ? (
        <label className="block">
          <span className="mb-1 block text-meta text-ink-1-mjuk">Kopiera länken</span>
          <input ref={falt} readOnly value={url} onFocus={(e) => e.currentTarget.select()} className={FALT_INPUT} />
        </label>
      ) : null}
    </div>
  )
}

/** Textlänken på bläckytan som fäller ut inbäddningskoden. */
export function BaddaInLank({ oppen, onToggle }: { oppen: boolean; onToggle: () => void }) {
  const [iIframe, setIIframe] = useState(false)
  useEffect(() => {
    try {
      setIIframe(window.self !== window.top)
    } catch {
      setIIframe(true)
    }
  }, [])
  if (iIframe) return null
  return (
    <button type="button" onClick={onToggle} aria-expanded={oppen} className={`${INK_LANK} min-h-11 text-left`}>
      {oppen ? 'Dölj inbäddningskoden' : 'Bädda in på er webbplats'}
    </button>
  )
}

/** Panelen med inbäddningskoden, under resultatet. */
export function BaddaInPanel({ slug, titel }: { slug: string; titel: string }) {
  const [kopierat, setKopierat] = useState(false)
  const iframeId = `jbc-${slug}`
  const snutt = [
    `<iframe src="https://www.jobbcoach.ai/embed/${slug}" id="${iframeId}" title="${titel}" style="width:100%;max-width:760px;border:0;border-radius:16px;" height="700" loading="lazy"></iframe>`,
    `<script>window.addEventListener("message",function(e){if(e.origin==="https://www.jobbcoach.ai"&&e.data&&e.data.jbcVerktyg==="${slug}"){document.getElementById("${iframeId}").height=e.data.jbcHeight}});</script>`,
    `<p style="font-size:14px;">Kalkylator från <a href="https://www.jobbcoach.ai/rakna-ut/${slug}">jobbcoach.ai</a></p>`,
  ].join('\n')

  async function kopiera() {
    try {
      await navigator.clipboard.writeText(snutt)
      setKopierat(true)
      setTimeout(() => setKopierat(false), 2000)
    } catch {
      /* markera och kopiera för hand ur fältet */
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-kant bg-panel p-4 sm:p-5">
      <p className="text-kort text-ink-1">Ge era läsare kalkylatorn på er egen sida</p>
      <p className="mt-1 text-sm leading-[22px] text-ink-2">
        Klistra in koden så får era läsare kalkylatorn direkt på er sida, alltid med årets siffror utan att ni behöver
        göra något. Enda villkoret är att källraden med länken till jobbcoach.ai står kvar.
      </p>
      <textarea
        readOnly
        value={snutt}
        rows={6}
        onFocus={(e) => e.currentTarget.select()}
        className="mt-3 w-full rounded-lg border border-kant bg-insunken p-3 font-mono text-meta text-ink-1 shadow-insunken focus:border-ink-1 focus:outline-none"
      />
      <button
        type="button"
        onClick={kopiera}
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg border border-kant-stark bg-panel px-4 text-sm font-medium text-ink-1 hover:bg-insunken sm:w-auto"
      >
        {kopierat ? 'Koden är kopierad' : 'Kopiera inbäddningskoden'}
      </button>
    </div>
  )
}
