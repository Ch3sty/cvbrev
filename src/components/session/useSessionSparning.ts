'use client'

// src/components/session/useSessionSparning.ts
// =============================================================================
// Sparandet i testlägen (plan-testflode-2026-11-20 avsnitt 1, Sparande):
// optimistisk nästa, svaret skickas i bakgrunden med kö och omförsök
// (useRobustAnswerSaving-mönstret). Ett nyare svar på samma uppgift ersätter
// det gamla i kön. Misslyckas sparningen efter omförsöken räknas den som
// osparad och ramen visar raden "Ett svar sparades inte" med "Försök igen",
// aldrig ett blockerande fel mitt i tiden. Före inlämningen töms kön.
//
// Routerna och POST-kropparna ägs av anroparen (skicka); hooken rör dem inte.
// =============================================================================

import { useCallback, useRef, useState } from 'react'

const OMFORSOK_MS = [500, 1500]
const vanta = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface Post<T> {
  data: T
  misslyckad: boolean
  /** Försöket som går just nu, så att tömningen väntar på det i stället för att skicka igen. */
  pagar: Promise<boolean> | null
}

export interface SessionSparning<T> {
  /** Lägger svaret i kön och skickar det i bakgrunden. */
  spara: (nyckel: string, data: T) => void
  /** Skickar allt som står i kön. Sant när kön är tom efteråt. */
  tom: () => Promise<boolean>
  /** Skickar de misslyckade igen (raden "Försök igen"). */
  forsokIgen: () => Promise<void>
  /** Antal svar som inte gick att spara efter omförsöken. */
  osparade: number
  /** Antal svar i kön just nu (skickas eller väntar). */
  iKo: () => number
}

/**
 * @param skicka Skickar ett svar. Sant när servern tog emot det (eller redan
 *   hade det, 409 och 410 räknas som tagna av anroparen).
 */
export function useSessionSparning<T>(skicka: (nyckel: string, data: T) => Promise<boolean>): SessionSparning<T> {
  const ko = useRef<Map<string, Post<T>>>(new Map())
  const [osparade, setOsparade] = useState(0)
  const skickaRef = useRef(skicka)
  skickaRef.current = skicka

  const rakna = useCallback(() => {
    let n = 0
    ko.current.forEach((p) => {
      if (p.misslyckad) n++
    })
    setOsparade(n)
  }, [])

  const forsok = useCallback((nyckel: string, post: Post<T>): Promise<boolean> => {
    if (post.pagar) return post.pagar
    const p = (async () => {
      let ok = false
      try {
        ok = await skickaRef.current(nyckel, post.data)
      } catch {
        ok = false
      }
      if (ok && ko.current.get(nyckel) === post) ko.current.delete(nyckel)
      return ok
    })()
    post.pagar = p
    void p.finally(() => {
      if (post.pagar === p) post.pagar = null
    })
    return p
  }, [])

  const spara = useCallback(
    (nyckel: string, data: T) => {
      const post: Post<T> = { data, misslyckad: false, pagar: null }
      ko.current.set(nyckel, post)
      rakna()
      void (async () => {
        if (await forsok(nyckel, post)) return rakna()
        for (const ms of OMFORSOK_MS) {
          await vanta(ms)
          // Ett nyare svar på samma uppgift har tagit över.
          if (ko.current.get(nyckel) !== post) return
          if (await forsok(nyckel, post)) return rakna()
        }
        if (ko.current.get(nyckel) === post) {
          post.misslyckad = true
          rakna()
        }
      })()
    },
    [forsok, rakna]
  )

  const tom = useCallback(async () => {
    const poster = Array.from(ko.current.entries())
    // Ett svar som redan är på väg väntas in; gick det inte fram skickas det en gång till.
    await Promise.all(
      poster.map(async ([k, p]) => {
        const ok = await forsok(k, p)
        if (!ok && ko.current.get(k) === p) await forsok(k, p)
      })
    )
    rakna()
    return ko.current.size === 0
  }, [forsok, rakna])

  const forsokIgen = useCallback(async () => {
    const poster = Array.from(ko.current.entries()).filter(([, p]) => p.misslyckad)
    await Promise.all(poster.map(([k, p]) => forsok(k, p)))
    rakna()
  }, [forsok, rakna])

  const iKo = useCallback(() => ko.current.size, [])

  return { spara, tom, forsokIgen, osparade, iKo }
}
