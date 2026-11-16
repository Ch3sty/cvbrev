/**
 * Rubrikerna att välja bland i rubrikarket.
 *
 * TILLFÄLLIGT: biblioteket bor i rubrikmodellen (src/lib/cv/rubriker.ts,
 * BIBLIOTEK, copywriterns lista, byggagent A). Tills den finns står ett urval
 * här; kompetensraden är skissens ordagrant. Byts mot A:s bibliotek.
 */
import type { Sektion } from '@/lib/cv/mallar/kontrakt'

export const RUBRIKBIBLIOTEK: Record<Sektion, readonly string[]> = {
  profil: ['Profil', 'Om mig', 'Sammanfattning', 'Yrkesprofil'],
  erfarenhet: ['Arbetslivserfarenhet', 'Erfarenhet', 'Yrkeserfarenhet', 'Klinisk erfarenhet', 'Pedagogisk erfarenhet', 'Uppdrag'],
  utbildning: ['Utbildning', 'Utbildning och kurser', 'Studier'],
  kompetenser: ['Kompetensområden', 'Kompetenser', 'Kärnkompetenser', 'System och verktyg'],
  intyg: ['Certifieringar', 'Legitimation och behörigheter', 'Behörigheter och körkort', 'Intyg och certifikat'],
  sprak: ['Språk', 'Språkkunskaper'],
  projekt: ['Projekt', 'Utvalda projekt', 'Uppdrag i urval'],
  intressen: ['Intressen', 'Fritid'],
  referenser: ['Referenser'],
}
