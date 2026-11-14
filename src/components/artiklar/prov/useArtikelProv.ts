'use client'

/**
 * Provet som startar i artikeln (SEO-planen 4.2, saas-leads slutliga beslut
 * 2026-11-10): uppgift 1 står i artikelns HTML. Ett svar startar provet på
 * sidan (POST /api/public/test-session med typ och artikel), de andra
 * uppgifterna följer i samma ruta och resultatet slutar i samma kontosteg
 * som provsidan. Facit lämnar aldrig servern före kontot.
 */

import { useCallback, useRef, useState } from 'react'
import { capture } from '@/lib/analytics/events'
import { mittTestForArtikel, sparaProvkalla } from '@/lib/analytics/provkalla'
import { storePendingTestSession } from '@/lib/letters/claim-draft-client'
import { sparaProv, type ProvaResultat, type Rutnat } from '@/lib/tests/prova-lokalt'
import { PROV_MITT_TEST, type ProvTyp } from '@/lib/tests/prov-typer'

export type ArtikelProvFas = 'forsta' | 'pagar' | 'resultat'

export interface ArtikelProvLage<U> {
  fas: ArtikelProvFas
  /** Uppgifterna från servern efter första svaret (uppgift 1 först). */
  uppgifter: U[]
  index: number
  total: number
  token: string | null
  resultat: ProvaResultat | null
  laddar: boolean
  fel: string | null
  registerHref: string | null
}

export function useArtikelProv<U>({
  typ,
  slug,
  total,
  lasUppgifter,
  rutnatFor,
}: {
  typ: ProvTyp
  slug: string
  total: number
  /** Svaret från starten till listan med uppgifter (matrisens questions, typernas uppgifter). */
  lasUppgifter: (data: Record<string, unknown>) => U[]
  /** Matrisens rutnät för brickorna; typerna har inga. */
  rutnatFor?: (u: U) => Rutnat
}) {
  const [lage, setLage] = useState<ArtikelProvLage<U>>({
    fas: 'forsta',
    uppgifter: [],
    index: 0,
    total,
    token: null,
    resultat: null,
    laddar: false,
    fel: null,
    registerHref: null,
  })
  const svar = useRef<(string | number | null)[]>([])
  const extra = useRef<Record<string, unknown>>({})

  const rattaProv = useCallback(
    async (token: string, alla: (string | number | null)[], uppgifter: U[]) => {
      setLage((l) => ({ ...l, laddar: true, fel: null }))
      try {
        const res = await fetch('/api/public/test-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, answers: alla }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Kunde inte rätta provet.')
        const r: ProvaResultat = {
          score: data.score,
          total: data.total,
          fel: Array.isArray(data.fel) ? data.fel : [],
          percentile: typeof data.percentile === 'number' ? data.percentile : null,
        }
        storePendingTestSession(token)
        sparaProv(token, r, rutnatFor ? uppgifter.map(rutnatFor) : [], typ)
        capture('sample_completed', { kind: 'test', cluster: 'test', test_kind: typ, plats: 'artikel', slug })
        capture('signup_gate_shown', { kind: 'test', cluster: 'test', test_kind: typ, plats: 'artikel', slug })
        setLage((l) => ({ ...l, fas: 'resultat', resultat: r, laddar: false }))
      } catch (e) {
        setLage((l) => ({ ...l, laddar: false, fel: e instanceof Error ? e.message : 'Kunde inte rätta provet.' }))
      }
    },
    [typ, slug, rutnatFor]
  )

  const svara = useCallback(
    async (s: string | number) => {
      if (lage.laddar) return
      // Uppgift 1: provet startar nu, med artikelns uppgift först.
      if (lage.fas === 'forsta') {
        setLage((l) => ({ ...l, laddar: true, fel: null }))
        try {
          const res = await fetch('/api/public/test-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ typ, artikel: slug }),
          })
          const data = await res.json()
          if (!res.ok) {
            setLage((l) => ({
              ...l,
              laddar: false,
              fel: data.message ?? data.error ?? 'Kunde inte starta provet.',
              registerHref: typeof data.registerHref === 'string' ? data.registerHref : null,
            }))
            return
          }
          const uppgifter = lasUppgifter(data)
          extra.current = data
          svar.current = [s]
          const mitt = mittTestForArtikel(slug) ?? PROV_MITT_TEST[typ]
          sparaProvkalla({ slug, via: 'smakprov', ...(mitt ? { mitt_test: mitt } : {}) })
          capture('sample_started', { kind: 'test', cluster: 'test', test_kind: typ, plats: 'artikel', slug })
          setLage((l) => ({ ...l, fas: 'pagar', uppgifter, index: 1, total: uppgifter.length, token: String(data.token), laddar: false }))
          if (uppgifter.length <= 1) void rattaProv(String(data.token), svar.current, uppgifter)
        } catch {
          setLage((l) => ({ ...l, laddar: false, fel: 'Vi nådde inte servern. Kontrollera uppkopplingen och försök igen.' }))
        }
        return
      }
      if (lage.fas !== 'pagar' || !lage.token) return
      svar.current = [...svar.current.slice(0, lage.index), s]
      if (lage.index + 1 < lage.uppgifter.length) {
        setLage((l) => ({ ...l, index: l.index + 1 }))
      } else {
        void rattaProv(lage.token, svar.current, lage.uppgifter)
      }
    },
    [lage, typ, slug, lasUppgifter, rattaProv]
  )

  return { lage, svara, extra: extra.current }
}
