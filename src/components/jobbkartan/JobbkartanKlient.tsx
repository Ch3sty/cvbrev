'use client'

/**
 * Startar Jobbkartans logik (app.ts) på den serverrenderade markupen. Ritar inget själv, så
 * React rör aldrig de element som app.ts fyller. Modulen laddas efter första bilden.
 *
 * Datan följer inte med som prop (då låg den en gång till i HTML-svaret som RSC-data) utan
 * hämtas från /jobbkartan/data/karta.json, parallellt med modulen. Bara dagens platsannonser,
 * några hundra byte, kommer från sidan. Går hämtningen inte står den serverritade kartan kvar
 * som den är.
 *
 * Startas en gång per rotelement. Städningen väntar ett varv och körs bara om roten har lämnat
 * sidan, så att Reacts dubbla effekt i utvecklingsläget inte kopplar allt två gånger.
 */
import { useEffect } from 'react'
import type { Annonser, JobbkartanKartdata } from '@/lib/jobbkartan/data'

const KARTDATA_URL = '/jobbkartan/data/karta.json'

const startade = new WeakMap<HTMLElement, () => void>()

export default function JobbkartanKlient({ annonser }: { annonser: Annonser | null }) {
  useEffect(() => {
    const rot = document.querySelector<HTMLElement>('.jk')
    if (!rot) return
    if (!startade.has(rot)) {
      startade.set(rot, () => {})
      const data = fetch(KARTDATA_URL).then((r) => {
        if (!r.ok) throw new Error(`${KARTDATA_URL}: ${r.status}`)
        return r.json() as Promise<JobbkartanKartdata>
      })
      Promise.all([data, import('./app')])
        .then(([kartdata, { starta }]) => {
          if (rot.isConnected) startade.set(rot, starta(rot, { ...kartdata, annonser }))
        })
        .catch((e) => {
          startade.delete(rot)
          console.warn('Jobbkartan startade inte', e)
        })
    }
    return () => {
      setTimeout(() => {
        if (rot.isConnected) return
        startade.get(rot)?.()
        startade.delete(rot)
      }, 0)
    }
  }, [annonser])
  return null
}
