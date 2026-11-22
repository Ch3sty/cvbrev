'use client'

/**
 * Sökfältet "Sök ditt yrke" över yrkesgrupperna på /cv-mallar (skissen
 * cv-mallar, SEO-beskedet avsnitt 8). Alla 74 yrken står redan i serverns
 * HTML; sökningen döljer bara kort som inte matchar, den ritar inga nya.
 * Under en sökning fälls alla grupper ut och grupper utan träff döljs.
 */

import { useEffect, useState } from 'react'

export default function YrkeSok({ listaId, tomId }: { listaId: string; tomId: string }) {
  const [q, setQ] = useState('')

  useEffect(() => {
    const lista = document.getElementById(listaId)
    if (!lista) return
    const s = q.trim().toLowerCase()
    lista.classList.toggle('cvm-sokning', Boolean(s))
    let totalt = 0
    lista.querySelectorAll<HTMLElement>('[data-grupp]').forEach((grupp) => {
      let synliga = 0
      grupp.querySelectorAll<HTMLElement>('li[data-yrke]').forEach((kort) => {
        const traff = !s || (kort.dataset.yrke ?? '').includes(s)
        kort.hidden = !traff
        if (traff) synliga++
      })
      if (s) grupp.querySelectorAll('details').forEach((d) => d.setAttribute('open', ''))
      grupp.hidden = synliga === 0
      totalt += synliga
    })
    const tom = document.getElementById(tomId)
    if (tom) tom.hidden = totalt > 0
  }, [q, listaId, tomId])

  return (
    <form className="cvm-sok" role="search" onSubmit={(e) => e.preventDefault()}>
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="11" cy="11" r="6.5" />
        <path d="M16 16l4.5 4.5" />
      </svg>
      <label htmlFor="cvm-yrke-sok" className="cvm-sr">
        Sök ditt yrke
      </label>
      <input
        id="cvm-yrke-sok"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Sök ditt yrke"
        autoComplete="off"
      />
    </form>
  )
}
