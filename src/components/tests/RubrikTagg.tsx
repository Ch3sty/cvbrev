'use client'

/**
 * Rubriknivån i testernas uppgiftskomponenter. I testerna och på provsidan är
 * uppgiftens fråga och underlagets titel h2. Inbäddad i en artikel
 * (ArtikelProv) blir de p, så att artikelns rubrikträd inte ändras
 * (SEO-planen 4.2: provet i artikeln får aldrig lägga till rubriker).
 */

import { createContext, useContext } from 'react'

export type RubrikTaggNamn = 'h2' | 'p'

const RubrikTaggContext = createContext<RubrikTaggNamn>('h2')

export const RubrikTaggProvider = RubrikTaggContext.Provider

export function useRubrikTagg(): RubrikTaggNamn {
  return useContext(RubrikTaggContext)
}
