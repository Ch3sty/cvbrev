'use client'

/**
 * Arket medan hon skriver (byggspecen avsnitt 7 punkt C): ett tunt anrop
 * till samma förhandsvisning som resten av CV-rummet (/api/cv/preview-html),
 * men byggt för tangenter i stället för mallbyten:
 *
 * - Kort paus först (450 ms): arket ritas när hon stannar upp, inte per tangent.
 * - En fråga i taget: en ny ändring avbryter den som är på väg.
 * - Det gamla arket står kvar skarpt tills det nya är klart (ingen tona-ned).
 * - Utkasten hamnar i ett eget litet minne, inte i flikens delade minne
 *   (hooks.ts), så att Mallars och Ditt CV:s miniatyrer inte trängs ut av
 *   halvskrivna meningar. Det sparade läget läses ur det delade minnet, så
 *   arkets första HTML från servern visas direkt.
 */
import { useEffect, useRef, useState } from 'react'
import { lasForhandsvisning, nyckelFor, type Kalla } from '@/components/cv/Dokument/hooks'

type InloggadKalla = Extract<Kalla, { typ: 'inloggad' }>

const PAUS_MS = 450
const UTKAST = new Map<string, string>()
const UTKAST_TAK = 8

function minns(nyckel: string, html: string) {
  UTKAST.delete(nyckel)
  UTKAST.set(nyckel, html)
  if (UTKAST.size > UTKAST_TAK) UTKAST.delete(UTKAST.keys().next().value as string)
}

function ur(k: InloggadKalla): string | null {
  return lasForhandsvisning(k) ?? UTKAST.get(nyckelFor(k)) ?? null
}

async function hamta(k: InloggadKalla, signal: AbortSignal): Promise<string> {
  const res = await fetch('/api/cv/preview-html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      template: k.mall,
      cvId: k.cvId,
      structuredData: k.structuredData || undefined,
      val: k.val,
      spok: k.spok || undefined,
    }),
    signal,
  })
  if (!res.ok) throw new Error(String(res.status))
  const j = (await res.json()) as { html?: string }
  if (!j.html) throw new Error('tom')
  return j.html
}

export interface LevandeArk {
  html: string | null
  /** En ny version är på väg; det gamla arket står kvar. */
  ritar: boolean
  fel: boolean
}

export function useLevandeArk(kalla: InloggadKalla): LevandeArk {
  const nyckel = nyckelFor(kalla)
  const [html, setHtml] = useState<string | null>(() => ur(kalla))
  const [ritar, setRitar] = useState(false)
  const [fel, setFel] = useState(false)
  const kallaRef = useRef(kalla)
  kallaRef.current = kalla

  useEffect(() => {
    const k = kallaRef.current
    const finns = ur(k)
    if (finns) {
      setHtml(finns)
      setRitar(false)
      return
    }
    const ac = new AbortController()
    setRitar(true)
    const t = window.setTimeout(() => {
      hamta(k, ac.signal)
        .then((h) => {
          minns(nyckel, h)
          setHtml(h)
          setFel(false)
          setRitar(false)
        })
        .catch((e) => {
          if ((e as Error)?.name === 'AbortError') return
          setFel(true)
          setRitar(false)
        })
    }, PAUS_MS)
    return () => {
      window.clearTimeout(t)
      ac.abort()
    }
  }, [nyckel])

  return { html, ritar, fel }
}
