'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Delnings-infrastruktur för kalkylatorerna: läs inmatning ur URL:ens
 * query-parametrar, håll adressfältet synkat medan användaren räknar
 * (history.replaceState, så att webbläsarlänken alltid är uträkningen),
 * och en rad direkt under resultatet med kopiera länk/resultat, enhetens
 * delningsmeny och bädda in-koden. Bädda in-knappen döljs när kalkylatorn
 * själv visas i en iframe. Källraden i inbäddningskoden använder
 * varumärkesankare (jobbcoach.ai), inte sökordsankare, i linje med
 * Googles riktlinjer för widgetlänkar.
 */

export function lasQuery(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

/** Synka query-parametrar utan omladdning. Hoppar över första anropet så att
 *  ett orört formulär inte skriver förval i adressfältet. */
export function useQuerySynk(params: Record<string, string | null>) {
  const forsta = useRef(true)
  const nyckel = JSON.stringify(params)
  useEffect(() => {
    if (forsta.current) {
      forsta.current = false
      return
    }
    const sp = new URLSearchParams(window.location.search)
    for (const [k, v] of Object.entries(params)) {
      if (v === null || v === '') sp.delete(k)
      else sp.set(k, v)
    }
    const qs = sp.toString()
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nyckel])
}

export function byggUrl(bas: string, params: Record<string, string | null>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== null && v !== '') sp.set(k, v)
  }
  const qs = sp.toString()
  return qs ? `${bas}?${qs}` : bas
}

const KNAPP_STIL =
  'rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-orange-400'

function BaddaPanel({ slug, titel }: { slug: string; titel: string }) {
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
      /* markera och kopiera manuellt ur textarean */
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-orange-200 bg-white p-4">
      <p className="mb-2 text-sm font-bold text-slate-900">Bädda in kalkylatorn på er webbplats, gratis</p>
      <p className="mb-3 text-sm leading-relaxed text-slate-600">
        Klistra in koden nedan så får era läsare kalkylatorn direkt på er sida,
        alltid uppdaterad med årets siffror utan att ni behöver göra något.
        Enda villkoret är att källraden med länken till jobbcoach.ai står kvar.
      </p>
      <textarea
        readOnly
        value={snutt}
        rows={6}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full rounded-lg border border-orange-200 bg-orange-50/40 p-3 font-mono text-xs text-slate-700 focus:border-orange-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={kopiera}
        className="mt-2 rounded-lg border border-orange-600 bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-700"
      >
        {kopierat ? 'Kopierad ✓' : 'Kopiera inbäddningskoden'}
      </button>
    </div>
  )
}

type DelaRadProps = {
  delUrl?: string
  resultatText?: string
  badda?: { slug: string; titel: string }
}

export function DelaRad({ delUrl, resultatText, badda }: DelaRadProps) {
  const [kopierat, setKopierat] = useState<'lank' | 'resultat' | null>(null)
  const [kanDela, setKanDela] = useState(false)
  const [iIframe, setIIframe] = useState(false)
  const [visaBadda, setVisaBadda] = useState(false)

  useEffect(() => {
    setKanDela(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
    try {
      setIIframe(window.self !== window.top)
    } catch {
      setIIframe(true)
    }
  }, [])

  const lankUrl = delUrl ?? (badda ? `https://www.jobbcoach.ai/rakna-ut/${badda.slug}` : null)

  async function kopiera(text: string, typ: 'lank' | 'resultat') {
    try {
      await navigator.clipboard.writeText(text)
      setKopierat(typ)
      setTimeout(() => setKopierat(null), 2000)
    } catch {
      /* utan clipboard-stöd finns länken kvar i adressfältet */
    }
  }

  async function dela() {
    try {
      await navigator.share({ text: resultatText ?? undefined, url: lankUrl ?? undefined })
    } catch {
      /* avbruten delning är inget fel */
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dela</span>
        {lankUrl && (
          <button type="button" onClick={() => kopiera(lankUrl, 'lank')} className={KNAPP_STIL}>
            {kopierat === 'lank' ? 'Länk kopierad ✓' : delUrl ? 'Kopiera länk till uträkningen' : 'Kopiera länk'}
          </button>
        )}
        {resultatText && (
          <button type="button" onClick={() => kopiera(resultatText, 'resultat')} className={KNAPP_STIL}>
            {kopierat === 'resultat' ? 'Resultat kopierat ✓' : 'Kopiera resultat'}
          </button>
        )}
        {kanDela && lankUrl && (
          <button type="button" onClick={dela} className={KNAPP_STIL}>
            Dela ...
          </button>
        )}
        {badda && !iIframe && (
          <button
            type="button"
            onClick={() => setVisaBadda(!visaBadda)}
            className={`${KNAPP_STIL} ${visaBadda ? 'border-orange-500 bg-orange-50' : ''}`}
          >
            {'</>'} Bädda in på er webbplats
          </button>
        )}
      </div>
      {visaBadda && badda && !iIframe && <BaddaPanel slug={badda.slug} titel={badda.titel} />}
    </div>
  )
}
