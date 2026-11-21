/**
 * Utlämningen av ett sparat analysresultat (analysForKlient), som används av
 * analysjobbets svar, den återupptagna analysen (?job=) och Mina CV.
 * Gratisnivån får aldrig åtgärdstexten för ett låst fynd, oavsett väg.
 */
import { describe, it, expect } from 'vitest'
import { analysForKlient } from '@/lib/cv/poang'
import { FIXTURER } from './fixturer'

const NORMALT = FIXTURER.find((f) => f.namn === 'normalt')!
const rad = { structured_data: NORMALT.structured_data, cv_text: NORMALT.cv_text }

/** En sparad analys av ett förbättrat CV: bär också fält med åtgärder. */
const sparad = {
  ...NORMALT.analys,
  atsFriendliness: { score: 62, feedback: 'x', missingKeywords: ['Hemligt nyckelord'] },
  implementedSkills: [{ skill: 'Kundtjänst', reasoning: 'Hemlig motivering' }],
  selectedImprovements: { profile: true, roles: [0, 1, 2], skills: [0, 1, 2, 3], general: [0] },
  detailedImprovements: [{ area: 'Roller', suggestion: 'Hemligt äldre förslag' }],
  quantificationSuggestions: ['Hemlig kvantifiering'],
}

describe('analysForKlient', () => {
  it('gratis: ingen åtgärdstext för låsta fynd finns i det som skickas', () => {
    const full = analysForKlient(sparad, rad, true)
    const gratis = analysForKlient(sparad, rad, false)
    const json = JSON.stringify(gratis)

    const synligaRoller = gratis.roleBasedImprovements as Array<{ suggestedText: string }>
    const synligaKomp = gratis.skillSuggestions as Array<{ skill: string }>
    const synligaAllm = gratis.generalImprovements as Array<{ description: string }>
    expect(synligaRoller.length + synligaKomp.length + synligaAllm.length).toBe(1)

    // Varje låst fynds åtgärd (rolltext, motivering, rådets beskrivning).
    const lasta = [
      ...(full.roleBasedImprovements as Array<{ suggestedText: string }>)
        .filter((r) => !synligaRoller.some((s) => s.suggestedText === r.suggestedText))
        .map((r) => r.suggestedText),
      ...(full.skillSuggestions as Array<{ skill: string; reasoning: string }>)
        .filter((k) => !synligaKomp.some((s) => s.skill === k.skill))
        .map((k) => k.reasoning),
      ...(full.generalImprovements as Array<{ description: string }>)
        .filter((g) => !synligaAllm.some((s) => s.description === g.description))
        .map((g) => g.description),
    ]
    expect(lasta.length).toBeGreaterThan(0)
    for (const text of lasta) {
      for (const del of text.split('\n')) expect(json).not.toContain(del)
    }
    for (const hemligt of ['Hemligt nyckelord', 'Hemlig motivering', 'Hemligt äldre förslag', 'Hemlig kvantifiering']) {
      expect(json).not.toContain(hemligt)
    }
    expect(gratis.selectedImprovements).toBeUndefined()

    // Det hon får: poängen, profilförslaget och rubrikerna på de låsta.
    expect((gratis.atsFriendliness as { score: number }).score).toBe((full.atsFriendliness as { score: number }).score)
    expect(gratis.profileSummary).toBeTruthy()
    expect((gratis.gated as { lockedFindings: unknown[] }).lockedFindings).toHaveLength(8)
  })

  it('premium får allt, med modellens tal', () => {
    const full = analysForKlient(sparad, rad, true)
    expect((full.roleBasedImprovements as unknown[]).length).toBe(3)
    expect(full.gated).toBeUndefined()
  })

  it('samma resultat oavsett väg: jobbsvaret och återupptagningen använder samma funktion', () => {
    expect(analysForKlient(sparad, rad, false)).toEqual(analysForKlient(structuredClone(sparad), rad, false))
  })
})
