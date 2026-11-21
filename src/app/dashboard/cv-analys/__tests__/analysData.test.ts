// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { byggAnalysVy } from '../analysData'
import { friaNycklarFor } from '@/lib/cv/analys/cvAnalys'
import { analysForKlient, poangsattAnalys } from '@/lib/cv/poang'
import { gateAnalysisResult } from '@/lib/cv/gateAnalysisResult'
import { FIXTURER } from '@/lib/cv/poang/__tests__/fixturer'

const MED_FORSLAG = FIXTURER.filter((f) => f.namn === 'normalt' || f.namn === 'student' || f.namn === 'tunt')

describe('Analys-sidan, gratisnivån: poängen och exakt ett fynd med åtgärd', () => {
  for (const f of MED_FORSLAG) {
    const rad = { structured_data: f.structured_data, cv_text: f.cv_text }
    const jobb = { id: 'jobb-' + f.namn, completed_at: null, result: f.analys as Record<string, unknown> }

    it(`${f.namn}: ett öppet fynd, inga texter i de låsta`, () => {
      const vy = byggAnalysVy(jobb, rad, false)!
      expect(vy.fynd.length).toBeGreaterThan(0)
      const oppna = vy.fynd.filter((x) => x.oppen)
      expect(oppna).toHaveLength(1)
      // Det öppna står först och har texterna.
      expect(vy.fynd[0].oppen).toBe(true)
      for (const l of vy.fynd.filter((x) => !x.oppen)) {
        expect(l.nuvarande).toBeUndefined()
        expect(l.forslag).toBeUndefined()
        expect(l.andrat).toBeUndefined()
      }
      // Talen är desamma som Premium ser.
      const full = byggAnalysVy(jobb, rad, true)!
      expect(vy.poang).toEqual(full.poang)
      expect(full.fynd.every((x) => x.oppen)).toBe(true)
    })

    it(`${f.namn}: servern skickar inte profilförslaget när det inte är det tyngsta`, () => {
      const gratis = analysForKlient(f.analys as Record<string, unknown>, rad, false)
      const full = poangsattAnalys(f.analys as Record<string, unknown>, rad)
      const fria = friaNycklarFor(full)
      expect(fria.length).toBeLessThanOrEqual(1)
      if (gratis.profileSummary) {
        expect(fria).toEqual(['profil'])
        expect((gratis.roleBasedImprovements as unknown[]).length + (gratis.skillSuggestions as unknown[]).length).toBe(0)
      } else {
        expect(fria).not.toContain('profil')
        expect(JSON.stringify(gratis)).not.toContain('improvedText')
      }
    })
  }

  it('ett låst profilförslag blir en rubrik utan text', () => {
    const result = {
      profileSummary: { atsImpact: 1, improvedText: 'Hemlig ny profiltext.' },
      roleBasedImprovements: [{ roleTitle: 'Säljare', company: 'Acme', atsImpact: 6, suggestedText: 'Sålde mer.' }],
      skillSuggestions: [],
      generalImprovements: [],
    }
    const g = gateAnalysisResult(result, false) as Record<string, unknown>
    expect(g.profileSummary).toBeUndefined()
    expect(JSON.stringify(g)).not.toContain('Hemlig')
    const meta = g.gated as { findingsTotal: number; lockedFindings: Array<{ id: string; title: string }> }
    expect(meta.findingsTotal).toBe(2)
    expect(meta.lockedFindings).toEqual([expect.objectContaining({ id: 'profile', title: 'Sammanfattningen' })])
    // Premium får allt.
    expect(gateAnalysisResult(result, true)).toBe(result)
  })
})
