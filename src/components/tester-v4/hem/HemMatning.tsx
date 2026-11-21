'use client'

/**
 * Mätningen av nya Hem (svepet före Black Week, 2026-11-19):
 *
 *   hem_visad            en gång per besök (fliken, sessionStorage), med
 *                        plan ja eller nej, gratis eller premium och antal
 *                        mätta testtyper
 *   tester_nav_klickad   tryck i navigeringen (Hem, Tester, Din utveckling)
 *                        med målet och sidan man stod på
 *   hem_ingang_klickad   tryck i ingångskorten Tester och Din utveckling,
 *                        med om det var knappen eller ett typkort
 *
 * Inga personuppgifter: bara tillstånd, antal och testtypens id. capture()
 * köar och skickar utan await, så ingen navigering väntar på mätningen.
 * sessionStorage kan saknas eller kasta (privat fönster, blockerad lagring);
 * då skickas hem_visad en gång per montering.
 *
 * Klicken fångas med onClickCapture på elementen som redan finns i
 * layouten (nav och ingångarnas rutnät), så att vyerna kan stå kvar som
 * server components och sticky-navigeringen inte får en ny förälder.
 */

import { useEffect, useRef, type ComponentPropsWithoutRef, type MouseEvent } from 'react'
import { capture } from '@/lib/analytics/events'
import { arHoppad, TJANSTFRAGA_NYCKEL } from '@/lib/tester/v4/tjanstfraga'
import type { NavVal } from './hemData'

/** Den sparade nyckeln för Hoppa över, eller null (saknas eller blockerad lagring). */
export function lasTjanstfraga(): string | null {
  try {
    return window.localStorage.getItem(TJANSTFRAGA_NYCKEL)
  } catch {
    return null
  }
}

const VISAD_NYCKEL = 'v4_hem_visad'

function redanVisadIBesoket(): boolean {
  try {
    if (window.sessionStorage.getItem(VISAD_NYCKEL) === '1') return true
    window.sessionStorage.setItem(VISAD_NYCKEL, '1')
  } catch {
    // Utan lagring räknas visningen per montering.
  }
  return false
}

/**
 * hem_visad en gång per besök. Ritar inget. `tjanstfragaNyckel` (Jobbsöket
 * omgång 2, 9.17) är kortets nyckel, eller null när serverns grind säger nej:
 * tjanstfraga är sann när nyckeln finns och frågan inte är hoppad på enheten.
 * Utelämnad nyckel ger ingen egenskap.
 */
export function HemVisad({ plan, premium, matta, tjanstfragaNyckel }: { plan: boolean; premium: boolean; matta: number; tjanstfragaNyckel?: string | null }) {
  const skickad = useRef(false)
  useEffect(() => {
    if (skickad.current) return
    skickad.current = true
    if (redanVisadIBesoket()) return
    const niva = premium ? 'premium' : 'gratis'
    const fraga = tjanstfragaNyckel === undefined ? {} : { tjanstfraga: tjanstfragaNyckel !== null && !arHoppad(lasTjanstfraga(), tjanstfragaNyckel) }
    capture('hem_visad', { plan, niva, matta_typer: matta, plattform: 'webb', ...fraga })
  }, [plan, premium, matta, tjanstfragaNyckel])
  return null
}

const NAV_VAL: readonly string[] = ['hem', 'tester', 'utveckling']

/** Navigeringens <nav> med klickmätningen. Samma element som förut, bara med onClickCapture. */
export function NavMedMatning({ sida, ...props }: ComponentPropsWithoutRef<'nav'> & { sida: NavVal }) {
  const klick = (e: MouseEvent<HTMLElement>) => {
    const mal = (e.target as HTMLElement).closest?.('[data-nav]')?.getAttribute('data-nav')
    if (!mal || !NAV_VAL.includes(mal)) return
    capture('tester_nav_klickad', { mal: mal as NavVal, sida, plattform: 'webb' })
  }
  return <nav {...props} onClickCapture={klick} />
}

/** Ingångarnas rutnät på Hem med klickmätningen. */
export function IngangarMedMatning(props: ComponentPropsWithoutRef<'div'>) {
  const klick = (e: MouseEvent<HTMLElement>) => {
    const mal = e.target as HTMLElement
    const lank = mal.closest?.('a')
    const ingang = lank?.closest('[data-ingang]')?.getAttribute('data-ingang')
    if (!lank || (ingang !== 'tester' && ingang !== 'utveckling')) return
    const typ = lank.getAttribute('data-katalog') ?? lank.getAttribute('data-typ')
    capture('hem_ingang_klickad', {
      ingang,
      kalla: typ ? 'typkort' : 'knapp',
      testtyp: typ ?? null,
      plattform: 'webb',
    })
  }
  return <div {...props} onClickCapture={klick} />
}
