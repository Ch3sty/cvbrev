'use client'

/**
 * Veckans mål i väggen med "Ändra" (BYGGSPEC F4): brickan och arket där
 * målet väljs, 1 till 10. Sparas med PUT /api/jobbsok/veckans-mal; rutten
 * mäter veckans_mal_andrat. Sidan läses om efteråt så att väggen och Att
 * göra nu räknar med det nya målet.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ark, StorKnapp, TextLank, ValKnapp, ValRad, VeckansMal } from '@/components/jobb3/kit'
import { VECKANS_MAL_MAX, VECKANS_MAL_MIN } from '@/lib/jobbsok'

const VECKANS_MAL_VAL = Array.from({ length: VECKANS_MAL_MAX - VECKANS_MAL_MIN + 1 }, (_, i) => VECKANS_MAL_MIN + i)

export default function VeckansMalAndra({ antal, mal, forval }: { antal: number; mal: number; forval: boolean }) {
  const router = useRouter()
  const [oppen, setOppen] = useState(false)
  const [valt, setValt] = useState(mal)
  const [sparar, setSparar] = useState(false)
  const [fel, setFel] = useState<string | null>(null)

  const oppna = () => {
    setValt(mal)
    setFel(null)
    setOppen(true)
  }

  const spara = async (nytt: number | null) => {
    setSparar(true)
    setFel(null)
    try {
      const res = await fetch('/api/jobbsok/veckans-mal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mal: nytt }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setOppen(false)
      router.refresh()
    } catch {
      setFel('Målet sparades inte. Försök igen.')
    } finally {
      setSparar(false)
    }
  }

  return (
    <>
      <VeckansMal antal={antal} mal={mal} onAndra={oppna} />
      <Ark
        open={oppen}
        onClose={() => setOppen(false)}
        rubrik="Ändra veckans mål"
        text="Hur många tjänster vill du söka i veckan? Veckan räknas måndag till söndag."
        fot={
          <>
            <StorKnapp bred onClick={() => spara(valt)} disabled={sparar}>
              {sparar ? 'Sparar' : `Spara ${valt} i veckan`}
            </StorKnapp>
            {!forval && mal !== 3 ? (
              <TextLank onClick={() => spara(null)}>Tillbaka till förvalet, tre i veckan</TextLank>
            ) : null}
          </>
        }
      >
        <ValRad etikett="Sökta tjänster i veckan">
          {VECKANS_MAL_VAL.map((n) => (
            <ValKnapp key={n} vald={valt === n} krymp onClick={() => setValt(n)}>
              {n}
            </ValKnapp>
          ))}
        </ValRad>
        {fel ? (
          <p className="j3-falt-fel" role="alert">
            {fel}
          </p>
        ) : null}
      </Ark>
    </>
  )
}
