import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { badgeLabel } from '../candidateData'

// Rekryterare ser aldrig råpoäng (andel rätt), saas-lead 2026-11-15: placering
// vid minst 25 testade, annars bara nivån. Kandidatens egen vy behåller sin procent.
describe('rekryterarvyn utan råpoäng', () => {
  it('etiketten utan percentil är bara familj och nivå', () => {
    expect(badgeLabel('matrislogik', 'grund', null)).toBe('Matrislogik · Grundnivå')
    expect(badgeLabel('matrislogik', 'grund', null)).not.toMatch(/rätt|%/)
  })

  it('etiketten med percentil visar placering', () => {
    expect(badgeLabel('verbal', 'expert', 92)).toMatch(/topp 8 %$/)
  })

  it('rekryterarens datatyper och vyer bär ingen bestScore', () => {
    const rot = path.resolve(__dirname, '../../../..')
    for (const fil of [
      'src/lib/recruiter/candidateData.ts',
      'src/app/rekryterare/components/profile/ProfileSections.tsx',
      'src/app/rekryterare/jamfor/page.tsx',
    ]) {
      const kod = fs.readFileSync(path.join(rot, fil), 'utf8')
      expect(kod, fil).not.toMatch(/bestScore/)
      expect(kod, fil).not.toMatch(/% rätt/)
    }
  })
})
