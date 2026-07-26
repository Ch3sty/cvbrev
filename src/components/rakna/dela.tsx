'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Delnings-infrastruktur för kalkylatorerna: läs inmatning ur URL:ens
 * query-parametrar, håll adressfältet synkat medan användaren räknar
 * (history.replaceState, så att webbläsarlänken alltid är uträkningen),
 * och en rad med kopiera länk/resultat samt enhetens delningsmeny.
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

export function DelaRad({ delUrl, resultatText }: { delUrl: string; resultatText: string }) {
  const [kopierat, setKopierat] = useState<'lank' | 'resultat' | null>(null)
  const [kanDela, setKanDela] = useState(false)

  useEffect(() => {
    setKanDela(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

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
      await navigator.share({ text: resultatText, url: delUrl })
    } catch {
      /* avbruten delning är inget fel */
    }
  }

  const knappStil =
    'rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-orange-400'

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Dela uträkningen</span>
      <button type="button" onClick={() => kopiera(delUrl, 'lank')} className={knappStil}>
        {kopierat === 'lank' ? 'Länk kopierad ✓' : 'Kopiera länk'}
      </button>
      <button type="button" onClick={() => kopiera(resultatText, 'resultat')} className={knappStil}>
        {kopierat === 'resultat' ? 'Resultat kopierat ✓' : 'Kopiera resultat'}
      </button>
      {kanDela && (
        <button type="button" onClick={dela} className={knappStil}>
          Dela ...
        </button>
      )}
    </div>
  )
}
