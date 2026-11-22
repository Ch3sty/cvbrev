'use client'

/**
 * Sökfältet i hjälten på /cv-exempel (navets skiss, i CV:ts färg). Ett
 * vanligt GET-formulär med ?q=, så att det fungerar utan JavaScript. Med
 * JavaScript filtreras korten direkt medan man skriver; alla kort ligger i
 * HTML:en, sökningen döljer bara dem som inte matchar. Samma beteende som
 * dagens sökfält (exempel/components/HubbSok.tsx), med grundens klasser
 * (p3-sok, p3-sok-falt i v3.css, samma som SokFalt).
 */

import { useEffect, useRef, useState } from 'react'

function filtrera(q: string, listaId: string, rubrikId: string, tomId: string) {
  const s = q.trim().toLowerCase()
  const kort = Array.from(document.querySelectorAll<HTMLElement>(`#${listaId} > li[data-yrke]`))
  let synliga = 0
  for (const k of kort) {
    const traff = !s || (k.dataset.yrke ?? '').includes(s)
    k.hidden = !traff
    if (traff) synliga++
  }
  const rubrik = document.getElementById(rubrikId)
  if (rubrik) rubrik.textContent = `${synliga} yrken`
  const tom = document.getElementById(tomId)
  if (tom) tom.hidden = synliga > 0
}

export default function CvSok({
  action,
  placeholder,
  listaId,
  rubrikId,
  tomId,
}: {
  action: string
  placeholder: string
  listaId: string
  rubrikId: string
  tomId: string
}) {
  const [q, setQ] = useState('')
  const forsta = useRef(true)

  useEffect(() => {
    const fran = new URLSearchParams(window.location.search).get('q') ?? ''
    if (fran) {
      setQ(fran)
      filtrera(fran, listaId, rubrikId, tomId)
    }
  }, [listaId, rubrikId, tomId])

  useEffect(() => {
    if (forsta.current) {
      forsta.current = false
      return
    }
    filtrera(q, listaId, rubrikId, tomId)
  }, [q, listaId, rubrikId, tomId])

  return (
    <form
      className="p3-sok"
      action={action}
      method="get"
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        const url = new URL(window.location.href)
        if (q.trim()) url.searchParams.set('q', q.trim())
        else url.searchParams.delete('q')
        window.history.replaceState(null, '', url.toString())
        filtrera(q, listaId, rubrikId, tomId)
        document.getElementById(listaId)?.scrollIntoView({ block: 'start' })
      }}
    >
      <span className="p3-sok-falt">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5L21 21" />
        </svg>
        <label htmlFor="cve-sok" className="p3-dold">
          Sök yrke
        </label>
        <input
          id="cve-sok"
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </span>
      <button type="submit" className="p3-knapp" data-primar="">
        Hitta exemplet
      </button>
    </form>
  )
}
