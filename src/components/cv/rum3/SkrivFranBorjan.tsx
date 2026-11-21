'use client'

/**
 * "Vilket jobb söker du?" och Börja skriva (skissen Hem-ny, kort 2): går
 * till CV-byggaren med titeln ifylld, och då hoppar byggaren över sitt
 * startblad (?borja=1). Utan titel öppnar byggaren startbladet som förut.
 *
 * Två toner: på väggen (Hem-ny) och på papper (arket Ett CV till).
 */
import { useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NYTT_ARK } from './texter'

export function byggarenHref(titel: string): string {
  const t = titel.trim().slice(0, 80)
  const q = new URLSearchParams({ fran: 'mina_cv' })
  if (t) {
    q.set('titel', t)
    q.set('borja', '1')
  }
  return `/dashboard/skapa-cv?${q.toString()}`
}

function Pil() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export default function SkrivFranBorjan({ ton }: { ton: 'vagg' | 'golv' }) {
  const id = useId()
  const router = useRouter()
  const [titel, setTitel] = useState('')
  return (
    <form
      className="cv3-skriv-form"
      data-ton={ton}
      onSubmit={(e) => {
        e.preventDefault()
        router.push(byggarenHref(titel))
      }}
    >
      <label htmlFor={id} className="cv3-skriv-etikett">
        {NYTT_ARK.jobb}
      </label>
      <div className="cv3-skriv-rad">
        <input
          id={id}
          type="text"
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder={NYTT_ARK.jobbPlatshallare}
          maxLength={80}
          autoComplete="organization-title"
          className="cv3-falt"
        />
        <button type="submit" className="cv3-glas">
          {NYTT_ARK.borja}
          <Pil />
        </button>
      </div>
    </form>
  )
}
