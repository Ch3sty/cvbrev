'use client'

/**
 * Sökfältet i hubbarna (spec-publikt-v2 del B 3.4). Ett vanligt GET-formulär
 * med ?q=, så att det fungerar utan JavaScript. Med JavaScript filtreras
 * korten direkt medan man skriver, och sidan förblir statisk (alla 89 kort
 * ligger i HTML, sökningen döljer bara de som inte matchar).
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

export default function HubbSok({
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
      className="ib-hubb-sok"
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
      <label htmlFor="hubb-sok" className="sr-only">
        Sök yrke
      </label>
      <input
        id="hubb-sok"
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      <button type="submit" className="pub-knapp" data-primar="">
        Hitta exemplet
      </button>
    </form>
  )
}
