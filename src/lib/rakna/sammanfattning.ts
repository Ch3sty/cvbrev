/**
 * Serversidans uppslag: slug plus query-parametrar in, resultatets
 * sammanfattning och de normaliserade parametrarna ut. Används av den
 * delade vyn (metadata) och OG-routen (bilden). Importerar skattetabellerna,
 * så modulen hör hemma på servern.
 */
import tabellerData from '@/data/skattetabeller-2026.json'
import type { Sok, Parametrar } from './sok'
import type { Sammanfattning } from './typer'
import type { Slug } from './delning'
import { beraknaLon, lasLon, lonParametrar, sammanfattaLon, type Tabeller } from './lonEfterSkatt'
import { anstalldParametrar, beraknaAnstalld, lasAnstalld, sammanfattaAnstalld } from './anstalldKostnad'
import { beraknaForhandling, forhandlingParametrar, lasForhandling, sammanfattaForhandling } from './loneforhandling'
import { beraknaSemester, lasSemester, sammanfattaSemester, semesterParametrar } from './semester'
import { beraknaTimlon, lasTimlon, sammanfattaTimlon, timlonParametrar } from './timlon'
import { beraknaUppsagning, idagIso, lasUppsagning, sammanfattaUppsagning, uppsagningParametrar } from './uppsagningstid'
import { beraknaFelrek, felrekParametrar, lasFelrek, sammanfattaFelrek } from './felrekrytering'
import { beraknaSourcing, lasSourcing, sammanfattaSourcing, sourcingParametrar } from './sourcing'
import { beraknaTraff, lasTraff, sammanfattaTraff, traffParametrar } from './traffsakerhet'

export const TABELLER = tabellerData as unknown as Tabeller

export interface Uppslag {
  sammanfattning: Sammanfattning
  parametrar: Parametrar
}

export function sammanfatta(slug: Slug, sok: Sok, idag: string = idagIso()): Uppslag {
  switch (slug) {
    case 'lon-efter-skatt': {
      const d = lasLon(sok)
      return { sammanfattning: sammanfattaLon(d, beraknaLon(d, TABELLER)), parametrar: lonParametrar(d) }
    }
    case 'vad-kostar-en-anstalld': {
      const d = lasAnstalld(sok)
      return { sammanfattning: sammanfattaAnstalld(d, beraknaAnstalld(d)), parametrar: anstalldParametrar(d) }
    }
    case 'loneforhandling': {
      const d = lasForhandling(sok)
      return { sammanfattning: sammanfattaForhandling(d, beraknaForhandling(d)), parametrar: forhandlingParametrar(d) }
    }
    case 'semesterersattning': {
      const d = lasSemester(sok)
      return { sammanfattning: sammanfattaSemester(d, beraknaSemester(d)), parametrar: semesterParametrar(d) }
    }
    case 'timlon-till-manadslon': {
      const d = lasTimlon(sok)
      return { sammanfattning: sammanfattaTimlon(d, beraknaTimlon(d)), parametrar: timlonParametrar(d) }
    }
    case 'uppsagningstid': {
      const d = lasUppsagning(sok)
      return {
        sammanfattning: sammanfattaUppsagning(d, beraknaUppsagning(d, idag)),
        parametrar: uppsagningParametrar(d, idag),
      }
    }
    case 'felrekrytering': {
      const d = lasFelrek(sok)
      return { sammanfattning: sammanfattaFelrek(d, beraknaFelrek(d)), parametrar: felrekParametrar(d) }
    }
    case 'sourcing': {
      const d = lasSourcing(sok)
      return { sammanfattning: sammanfattaSourcing(d, beraknaSourcing(d)), parametrar: sourcingParametrar(d) }
    }
    case 'traffsakerhet': {
      const d = lasTraff(sok)
      return { sammanfattning: sammanfattaTraff(d, beraknaTraff(d)), parametrar: traffParametrar(d) }
    }
  }
}
