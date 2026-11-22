'use client'

/**
 * Skrivfältet och frågorna utifrån läget i hjältens samtal på
 * /verktyg/jobbcoachen (publikt omgång 3, "inga genvägar"). Besökaren
 * skriver en egen fråga eller trycker på ett förslag, så står det i fältet,
 * precis som i kontot. Skicka leder genom registreringen till Jobbcoachen i
 * kontot med frågan i fältet (coachHref), där hon skickar sitt första
 * meddelande.
 *
 * Förslagen är produktens riktiga (src/lib/jobbsok/coach.ts); bokstäverna
 * på brickorna är exempel. Klasserna jc- står i jobbcoachen.css.
 */

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { coachHref } from './coach-href'

const FORSLAG = [
  { bokstaver: 'DA', ton: 'jc-tyst', fraga: 'Vad skriver jag i ett uppföljningsmejl?' },
  { bokstaver: 'PO', ton: 'jc-int', fraga: 'Vad frågar jag arbetsgivaren på intervjun?' },
]

function Pil() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export default function CoachFraga() {
  const router = useRouter()
  const [text, setText] = useState('')
  const falt = useRef<HTMLInputElement>(null)

  function skicka(e: FormEvent) {
    e.preventDefault()
    router.push(coachHref(text))
  }

  return (
    <>
      <form className="jc-skriv" onSubmit={skicka}>
        <label className="sr-only" htmlFor="jc-fraga">
          Skriv en fråga till Jobbcoachen
        </label>
        <input
          id="jc-fraga"
          ref={falt}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv en fråga"
          maxLength={500}
          autoComplete="off"
        />
        <button type="submit" aria-label="Fråga Jobbcoachen">
          <Pil />
        </button>
      </form>
      <div className="jc-laget">
        <b>Frågor utifrån ditt läge</b>
        <small>Hämtade ur dina sökta tjänster. Tryck på en, så står den i fältet.</small>
        {FORSLAG.map((f) => (
          <button
            key={f.fraga}
            type="button"
            className={`jc-forslagrad ${text === f.fraga ? 'jc-vald' : ''}`.trim()}
            aria-pressed={text === f.fraga}
            onClick={() => {
              setText(f.fraga)
              falt.current?.focus()
            }}
          >
            <span className={`jc-br ${f.ton}`} aria-hidden="true">
              {f.bokstaver}
            </span>
            {f.fraga}
          </button>
        ))}
      </div>
    </>
  )
}
