/**
 * Intervjuprovets två frågor (docs/design/intervjuprov-spec-2026-09-23.md).
 *
 * Klientsäker, ren data. promptFokus går bara till servern som underlag för
 * bedömningen, men står här så att frågan och det rekryteraren letar efter
 * alltid ändras tillsammans.
 */

export type FragaId = 'styrkor' | 'star'

export interface Fraga {
  /** Frågan som den ställs i rummet, utan citattecken. */
  text: string
  platshallare: string
  /** Tipsraden under fältet. För star ritas delarna som chips. */
  tips: string
  /** Vad en rekryterare letar efter i just den här frågan. */
  promptFokus: string
}

export const FRAGOR: Record<FragaId, Fraga> = {
  styrkor: {
    text: 'Vilka är dina styrkor och svagheter?',
    platshallare:
      'Skriv som du skulle säga det. En styrka med ett exempel, en svaghet och vad du gör åt den.',
    tips: 'Ha med: en styrka med ett konkret exempel, en svaghet och vad du gör åt den.',
    promptFokus:
      'Rekryteraren letar efter självinsikt och relevans. En bra styrka är namngiven och bevisad med ett konkret exempel, gärna med en siffra eller ett tydligt utfall, och hänger ihop med vad rollen kräver. En bra svaghet är genuin men hanterbar, inte en kärnkompetens i rollen och inte en klyscha som "perfektionist" eller "jobbar för hårt". Den har ett exempel på när den märkts och en konkret plan för vad kandidaten gör åt den. Det vanligaste som saknas är planen för svagheten eller exemplet för styrkan.',
  },
  star: {
    text: 'Berätta om en gång då du löste ett problem som ingen annan tog tag i.',
    platshallare:
      'Skriv som du skulle säga det. Vad var läget, vad var din uppgift, vad gjorde du och vad blev resultatet.',
    tips: 'Ha med:',
    promptFokus:
      'Frågan är kompetensbaserad och besvaras bäst med STAR: Situation (kort och konkret), Uppgift (varför det blev kandidatens sak), Handling (vad kandidaten själv gjorde, i jag-form, steg för steg, den längsta delen) och Resultat (ett tydligt utfall, gärna mätbart, och gärna en lärdom). Rekryteraren letar efter initiativförmåga, problemlösning och eget ansvar. Det vanligaste som saknas är resultatet, eller att handlingen beskrivs i vi-form så att kandidatens eget bidrag inte syns.',
  },
}

/** STAR-delarna, i ordning. Chips i tipsraden och rubriker på dashboardsidan. */
export const STAR_DELAR = ['Situation', 'Uppgift', 'Handling', 'Resultat'] as const

export function arFragaId(v: unknown): v is FragaId {
  return v === 'styrkor' || v === 'star'
}
