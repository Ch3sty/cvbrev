// src/lib/lagring/originalfil.ts
//
// Originalfilen bakom ett CV i kontot (klicktestet på live 2026-11-22,
// punkt 1): den PDF eller Word-fil hon laddade upp, i den privata hinken cvs
// under users/<id>/. Rutten GET /api/cv/originalfil öppnar den med en
// signerad länk, och Ditt CV visar knappen bara när det finns en fil att
// öppna. Ren och klientsäker.
//
// Det finns ingen fil för CV som skrivits i byggaren (ai-improved/),
// hämtats från provsidorna (prova/) eller importerats från LinkedIn, och
// äldre CV kan sakna vägen helt. Då finns ingen knapp.

import { inomEgenMapp } from './sokvagar'

/** Filändelserna uppladdningen tar emot. */
const ANDELSER = /\.(pdf|docx|doc|txt)$/i

/**
 * Vägen till originalfilen i hinken cvs, eller null när CV:t inte har någon
 * som kontot själv får läsa.
 */
export function originalfilSokvag(sokvag: string | null | undefined, userId: string | null | undefined): string | null {
  if (!sokvag || !userId) return null
  if (!inomEgenMapp(sokvag, userId)) return null
  const fil = sokvag.split('/').pop() ?? ''
  if (!ANDELSER.test(fil) || fil.startsWith('.')) return null
  return sokvag
}

/** Adressen knappen öppnar. */
export function originalfilHref(cvId: string): string {
  return `/api/cv/originalfil?cv=${encodeURIComponent(cvId)}`
}

/** Filnamnet nedladdningen får: det hon laddade upp, annars filens namn i hinken. */
export function originalfilNamn(fileName: string | null | undefined, sokvag: string): string {
  const andelse = sokvag.match(ANDELSER)?.[0] ?? ''
  const namn = (fileName ?? '').trim()
  if (namn && ANDELSER.test(namn)) return namn
  if (namn) return `${namn}${andelse}`
  return sokvag.split('/').pop() ?? `cv${andelse}`
}
