'use client'

/**
 * Hintarnas mätning och stängning (planen 3.3, A8):
 *
 *   hint_visad    en gång per hint och dag, nyckeln i localStorage
 *   hint_klickad  vid tryck på hintens knapp eller rad
 *   stängt        första steget (forsta_steg) går att stänga; valet sparas
 *                 i localStorage per hint
 *
 * localStorage kan saknas eller kasta (privat fönster, blockerad lagring),
 * så varje läsning och skrivning står i try/catch och vyn ritas rätt utan
 * den: då skickas hint_visad en gång per sidvisning och stängningen gäller
 * tills sidan laddas om.
 */

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { capture } from '@/lib/analytics/events'
import type { Hint, TestTypId } from '@/lib/tester/v4/typer'

const VISAD = 'v4_hint_visad:'
const STANGD = 'v4_hint_stangd:'

/** Minnet när localStorage inte går att använda. */
const minne = new Map<string, string>()

function las(nyckel: string): string | null {
  try {
    return window.localStorage.getItem(nyckel)
  } catch {
    return minne.get(nyckel) ?? null
  }
}

function skriv(nyckel: string, varde: string): void {
  try {
    window.localStorage.setItem(nyckel, varde)
  } catch {
    minne.set(nyckel, varde)
  }
}

/** Sant om hinten redan räknats som visad den här dagen. Ren för testerna. */
export function redanVisad(id: string, idag: string): boolean {
  return las(VISAD + id) === idag
}

export interface HintKontext {
  /** mittTest för planen, null utan plan. */
  planTest: string | null
  /** Planens typer, för i_planens_test. */
  planTyper: readonly TestTypId[]
}

function egenskaper(h: Pick<Hint, 'id' | 'typ' | 'testtyp'>, k: HintKontext, plats: number) {
  return {
    hint_typ: h.typ,
    hint_id: h.id,
    testtyp: h.testtyp,
    plats,
    plan_test: k.planTest,
    i_planens_test: h.testtyp ? k.planTyper.includes(h.testtyp) : false,
    plattform: 'webb' as const,
  }
}

/** Skickar hint_visad en gång per hint och dag. Ritar inget. */
export function HintVisad({ hintar, idag, kontext }: { hintar: Pick<Hint, 'id' | 'typ' | 'testtyp'>[]; idag: string; kontext: HintKontext }) {
  const skickade = useRef(new Set<string>())
  const nyckel = hintar.map((h) => h.id).join('|')
  useEffect(() => {
    hintar.forEach((h, i) => {
      if (skickade.current.has(h.id) || redanVisad(h.id, idag)) return
      skickade.current.add(h.id)
      skriv(VISAD + h.id, idag)
      capture('hint_visad', egenskaper(h, kontext, i))
    })
    // Hintarnas id:n bär hela beroendet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nyckel, idag])
  return null
}

export function hintKlickad(h: Pick<Hint, 'id' | 'typ' | 'testtyp'>, kontext: HintKontext, plats: number): void {
  capture('hint_klickad', egenskaper(h, kontext, plats))
}

/* Stängningen som extern butik: servern och första målningen ser "öppen". */
const lyssnare = new Set<() => void>()
function prenumerera(fn: () => void) {
  lyssnare.add(fn)
  return () => lyssnare.delete(fn)
}

export function useHintStangd(id: string): [boolean, () => void] {
  const stangd = useSyncExternalStore(
    prenumerera,
    () => las(STANGD + id) === '1',
    () => false
  )
  const stang = () => {
    skriv(STANGD + id, '1')
    lyssnare.forEach((fn) => fn())
  }
  return [stangd, stang]
}
