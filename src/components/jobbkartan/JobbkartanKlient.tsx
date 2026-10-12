'use client'

/**
 * Startar Jobbkartans logik (app.ts) på den serverrenderade markupen. Ritar inget själv, så
 * React rör aldrig de element som app.ts fyller. Modulen laddas efter första bilden.
 *
 * Startas en gång per rotelement. Städningen väntar ett varv och körs bara om roten har lämnat
 * sidan, så att Reacts dubbla effekt i utvecklingsläget inte kopplar allt två gånger.
 */
import { useEffect } from 'react'
import type { JobbkartanData } from '@/lib/jobbkartan/data'

const startade = new WeakMap<HTMLElement, () => void>()

export default function JobbkartanKlient({ data }: { data: JobbkartanData }) {
  useEffect(() => {
    const rot = document.querySelector<HTMLElement>('.jk')
    if (!rot) return
    if (!startade.has(rot)) {
      startade.set(rot, () => {})
      import('./app').then(({ starta }) => {
        if (rot.isConnected) startade.set(rot, starta(rot, data))
      })
    }
    return () => {
      setTimeout(() => {
        if (rot.isConnected) return
        startade.get(rot)?.()
        startade.delete(rot)
      }, 0)
    }
  }, [data])
  return null
}
